import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  MARKDOWN_CONTENT_TYPE,
  SITE_ORIGIN,
  VARY_ACCEPT,
  articleMarkdown,
  buildSitemapXml,
  markdownPathFromRequest,
  negotiateAccept,
  notFoundMarkdown,
  staticMarkdownForPath,
  staticSitemapUrls,
  wikiLookupFromMarkdownPath,
} from "@workspace/agent-site";
import { getOpenApiJson, getOpenApiYaml } from "../lib/openapi-spec";

const router = Router();

function sendMarkdown(res: import("express").Response, status: number, body: string) {
  res.status(status);
  res.setHeader("Content-Type", MARKDOWN_CONTENT_TYPE);
  res.setHeader("Vary", VARY_ACCEPT);
  res.send(body);
}

router.get("/openapi.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(getOpenApiJson());
});

router.get("/openapi.yaml", (_req, res) => {
  res.setHeader("Content-Type", "application/yaml; charset=utf-8");
  res.send(getOpenApiYaml());
});

router.get("/sitemap.xml", async (_req, res) => {
  const articles = await db
    .select({
      slug: articlesTable.slug,
      category: articlesTable.category,
      updatedAt: articlesTable.updatedAt,
    })
    .from(articlesTable);
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...staticSitemapUrls(today),
    ...articles.map((article) => ({
      loc: `${SITE_ORIGIN}/wiki/${article.category}/${article.slug}`,
      lastmod: article.updatedAt.toISOString().slice(0, 10),
    })),
  ];
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(buildSitemapXml(urls));
});

async function handleMarkdown(req: import("express").Request, res: import("express").Response) {
  const negotiation = negotiateAccept(req.headers.accept);
  if (negotiation === "not_acceptable") {
    res.status(406);
    res.setHeader("Vary", VARY_ACCEPT);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("Not Acceptable");
    return;
  }

  const requestPath = req.path.replace(/^\/markdown\/?/, "/") || "/";
  const pagePath = markdownPathFromRequest(requestPath === "/" ? "/" : requestPath);
  const staticBody = staticMarkdownForPath(pagePath);
  if (staticBody) {
    sendMarkdown(res, 200, staticBody);
    return;
  }

  const wiki = wikiLookupFromMarkdownPath(pagePath);
  if (wiki) {
    const [article] = await db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.slug, wiki.slug));
    if (!article) {
      sendMarkdown(res, 404, notFoundMarkdown());
      return;
    }
    sendMarkdown(
      res,
      200,
      articleMarkdown({
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        slug: article.slug,
      }),
    );
    return;
  }

  sendMarkdown(res, 404, notFoundMarkdown());
}

router.get("/markdown", handleMarkdown);
router.get("/markdown/{*path}", handleMarkdown);

export default router;
