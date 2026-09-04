import { Router } from "express";
import { db, articlesTable, categoriesTable, toolsTable } from "@workspace/db";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { SITE_NAME, SITE_ORIGIN } from "@workspace/agent-site";
import { sendApiError } from "../lib/json-error";
import { ensureDefaultCategories } from "../lib/seed-categories";

const PROTOCOL_VERSION = "2025-03-26";
const SERVER_NAME = "legend-of-elements-wiki";
const SERVER_VERSION = "0.1.0";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const tools = [
  {
    name: "search_articles",
    description: "Search Legend of Elements Wiki articles by title, excerpt, or content.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query" },
        category: { type: "string", description: "Optional category slug" },
      },
      required: ["q"],
    },
  },
  {
    name: "get_article",
    description: "Get a wiki article by slug.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Unique article slug" },
      },
      required: ["slug"],
    },
  },
  {
    name: "list_articles",
    description: "List wiki articles, optionally filtered by category.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
    },
  },
  {
    name: "list_categories",
    description: "List wiki categories with article counts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_wiki_stats",
    description: "Get aggregate wiki statistics.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_tools",
    description: "List adjacent community tools and sites linked from the wiki.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
] as const;

function serializeArticle(article: typeof articlesTable.$inferSelect) {
  return {
    ...article,
    tags: article.tags ?? [],
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

function jsonRpcResult(id: string | number | null | undefined, result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function jsonRpcError(
  id: string | number | null | undefined,
  code: number,
  message: string,
) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "search_articles": {
      const q = String(args.q ?? "");
      if (!q) throw new Error("q is required");
      const category = typeof args.category === "string" ? args.category : undefined;
      const textFilter = or(
        ilike(articlesTable.title, `%${q}%`),
        ilike(articlesTable.excerpt, `%${q}%`),
        ilike(articlesTable.content, `%${q}%`),
      );
      const filter = category ? and(textFilter, eq(articlesTable.category, category)) : textFilter;
      const rows = await db
        .select()
        .from(articlesTable)
        .where(filter)
        .orderBy(desc(articlesTable.viewCount))
        .limit(20);
      return rows.map(serializeArticle);
    }
    case "get_article": {
      const slug = String(args.slug ?? "");
      const [article] = await db.select().from(articlesTable).where(eq(articlesTable.slug, slug));
      if (!article) throw new Error(`No article with slug ${slug}`);
      return serializeArticle(article);
    }
    case "list_articles": {
      const limit = Math.min(Number(args.limit) || 20, 50);
      const category = typeof args.category === "string" ? args.category : undefined;
      let query = db.select().from(articlesTable).$dynamic();
      if (category) query = query.where(eq(articlesTable.category, category));
      const rows = await query.limit(limit).orderBy(desc(articlesTable.updatedAt));
      return rows.map(serializeArticle);
    }
    case "list_categories": {
      await ensureDefaultCategories();
      const cats = await db.select().from(categoriesTable);
      const counts = await db
        .select({
          category: articlesTable.category,
          count: sql<number>`count(*)::int`,
        })
        .from(articlesTable)
        .groupBy(articlesTable.category);
      const countMap = new Map(counts.map((row) => [row.category, row.count]));
      return cats.map((cat) => ({ ...cat, articleCount: countMap.get(cat.slug) ?? 0 }));
    }
    case "get_wiki_stats": {
      await ensureDefaultCategories();
      const [{ totalArticles }] = await db
        .select({ totalArticles: sql<number>`count(*)::int` })
        .from(articlesTable);
      const [{ totalCategories }] = await db
        .select({ totalCategories: sql<number>`count(*)::int` })
        .from(categoriesTable);
      const [{ totalViews }] = await db
        .select({ totalViews: sql<number>`coalesce(sum(view_count), 0)::int` })
        .from(articlesTable);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [{ recentEdits }] = await db
        .select({ recentEdits: sql<number>`count(*)::int` })
        .from(articlesTable)
        .where(sql`updated_at > ${oneWeekAgo}`);
      return { totalArticles, totalCategories, totalViews, recentEdits };
    }
    case "list_tools": {
      const rows = await db
        .select()
        .from(toolsTable)
        .orderBy(asc(toolsTable.sortOrder), asc(toolsTable.id));
      return rows.map((tool) => ({
        ...tool,
        createdAt: tool.createdAt.toISOString(),
        updatedAt: tool.updatedAt.toISOString(),
      }));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRpc(body: JsonRpcRequest) {
  const { id, method, params } = body;
  if (body.jsonrpc !== "2.0" || !method) {
    return { status: 400, payload: jsonRpcError(id, -32600, "Invalid Request") };
  }

  if (method === "notifications/initialized" || method.startsWith("notifications/")) {
    return { status: 202, payload: null };
  }

  if (method === "initialize") {
    return {
      status: 200,
      payload: jsonRpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, title: SITE_NAME, version: SERVER_VERSION },
        instructions: `Use these tools to search and read ${SITE_NAME} articles. Docs: ${SITE_ORIGIN}/docs`,
      }),
    };
  }

  if (method === "ping") {
    return { status: 200, payload: jsonRpcResult(id, {}) };
  }

  if (method === "tools/list") {
    return { status: 200, payload: jsonRpcResult(id, { tools }) };
  }

  if (method === "tools/call") {
    const name = String(params?.name ?? "");
    const args =
      params?.arguments && typeof params.arguments === "object"
        ? (params.arguments as Record<string, unknown>)
        : {};
    try {
      const data = await callTool(name, args);
      return {
        status: 200,
        payload: jsonRpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(data) }],
        }),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tool call failed";
      return {
        status: 200,
        payload: jsonRpcResult(id, {
          content: [{ type: "text", text: message }],
          isError: true,
        }),
      };
    }
  }

  return { status: 200, payload: jsonRpcError(id, -32601, `Method not found: ${method}`) };
}

const router = Router();

router.get("/mcp", (_req, res) => {
  res.setHeader("Allow", "POST");
  sendApiError(
    res,
    405,
    "METHOD_NOT_ALLOWED",
    "This MCP server is Streamable HTTP POST-only",
    `POST JSON-RPC to ${SITE_ORIGIN}/mcp after reading ${SITE_ORIGIN}/.well-known/mcp`,
  );
});

router.post("/mcp", async (req, res) => {
  const body = req.body as JsonRpcRequest;
  const result = await handleRpc(body);
  if (result.status === 202) {
    res.status(202).end();
    return;
  }
  res.status(result.status).json(result.payload);
});

router.get("/well-known/mcp", (_req, res) => {
  res.json({
    mcp_version: "1.0",
    server_name: SITE_NAME,
    server_version: SERVER_VERSION,
    endpoints: {
      streamable_http: `${SITE_ORIGIN}/mcp`,
    },
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
    authentication: {
      required: false,
      methods: [],
    },
    documentation: `${SITE_ORIGIN}/docs`,
  });
});

export default router;
