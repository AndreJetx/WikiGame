import { Router } from "express";
import { db, articlesTable, pool } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import {
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  UpdateArticleParams,
  UpdateArticleBody,
  DeleteArticleParams,
  ListRecentArticlesQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { sendApiError } from "../lib/json-error";

const router = Router();

const ARTWORK_ASPECTS = ["16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16"] as const;
type ArtworkAspect = (typeof ARTWORK_ASPECTS)[number];
const ARTWORK_ASPECT_SET = new Set<string>(ARTWORK_ASPECTS);

let imageAspectReady: Promise<void> | null = null;

function ensureImageAspectColumn() {
  imageAspectReady ??= pool
    .query("ALTER TABLE wiki.articles ADD COLUMN IF NOT EXISTS image_aspect text")
    .then(() => undefined);
  return imageAspectReady;
}

function artworkAspect(category: string, value: string | null | undefined): ArtworkAspect | null {
  if (category !== "artwork") return null;
  if (value && ARTWORK_ASPECT_SET.has(value)) return value as ArtworkAspect;
  return "3:4";
}

router.use(async (_req, _res, next) => {
  try {
    await ensureImageAspectColumn();
    next();
  } catch (error) {
    next(error);
  }
});

router.get("/articles", async (req, res) => {
  const parsed = ListArticlesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_PARAMS",
      "Invalid query params",
      "Use category, tag, limit, and offset as documented in /openapi.json",
    );
    return;
  }
  const { category, tag, limit = 50, offset = 0 } = parsed.data;
  let query = db.select().from(articlesTable).$dynamic();
  if (category) query = query.where(eq(articlesTable.category, category));
  const articles = await query.limit(limit).offset(offset).orderBy(desc(articlesTable.updatedAt));
  const result = articles
    .filter((a) => !tag || a.tags.includes(tag))
    .map((a) => ({
      ...a,
      tags: a.tags ?? [],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  res.json(result);
});

router.get("/articles/featured", async (req, res) => {
  const articles = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.featured, true))
    .orderBy(desc(articlesTable.updatedAt))
    .limit(6);
  res.json(
    articles.map((a) => ({
      ...a,
      tags: a.tags ?? [],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }))
  );
});

router.get("/articles/recent", async (req, res) => {
  const parsed = ListRecentArticlesQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
  const articles = await db
    .select()
    .from(articlesTable)
    .orderBy(desc(articlesTable.updatedAt))
    .limit(limit);
  res.json(
    articles.map((a) => ({
      ...a,
      tags: a.tags ?? [],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }))
  );
});

router.get("/articles/:slug", async (req, res) => {
  const parsed = GetArticleParams.safeParse(req.params);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_PARAMS",
      "Invalid params",
      "Provide a string slug as documented in /openapi.json",
    );
    return;
  }
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, parsed.data.slug));
  if (!article) {
    sendApiError(
      res,
      404,
      "NOT_FOUND",
      "No article with that slug",
      "GET /api/articles or GET /api/search?q= to find a valid slug",
    );
    return;
  }
  // increment view count
  await db
    .update(articlesTable)
    .set({ viewCount: sql`${articlesTable.viewCount} + 1` })
    .where(eq(articlesTable.id, article.id));
  res.json({
    ...article,
    viewCount: article.viewCount + 1,
    tags: article.tags ?? [],
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  });
});

router.post("/articles", requireAdmin, async (req, res) => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_BODY",
      "Invalid body",
      "Send ArticleInput JSON as documented in /openapi.json",
    );
    return;
  }
  if (parsed.data.imageAspect && !ARTWORK_ASPECT_SET.has(parsed.data.imageAspect)) {
    sendApiError(
      res,
      400,
      "INVALID_BODY",
      "Invalid body",
      "imageAspect must be 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, or 9:16",
    );
    return;
  }
  const [article] = await db
    .insert(articlesTable)
    .values({
      ...parsed.data,
      tags: parsed.data.tags ?? [],
      imageAspect: artworkAspect(parsed.data.category, parsed.data.imageAspect),
    })
    .returning();
  res.status(201).json({
    ...article,
    tags: article.tags ?? [],
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  });
});

router.put("/articles/:slug", requireAdmin, async (req, res) => {
  const paramsParsed = UpdateArticleParams.safeParse(req.params);
  const bodyParsed = UpdateArticleBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_REQUEST",
      "Invalid request",
      "Check slug and ArticleUpdate fields in /openapi.json",
    );
    return;
  }
  if (bodyParsed.data.imageAspect && !ARTWORK_ASPECT_SET.has(bodyParsed.data.imageAspect)) {
    sendApiError(
      res,
      400,
      "INVALID_REQUEST",
      "Invalid request",
      "imageAspect must be 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, or 9:16",
    );
    return;
  }
  const updates = { ...bodyParsed.data, updatedAt: new Date() };
  if (updates.category === "artwork" || updates.imageAspect !== undefined) {
    const [current] = await db
      .select({ category: articlesTable.category })
      .from(articlesTable)
      .where(eq(articlesTable.slug, paramsParsed.data.slug));
    const category = updates.category ?? current?.category ?? "";
    updates.imageAspect = category === "artwork"
      ? artworkAspect(category, updates.imageAspect)
      : null;
  } else if (updates.category && updates.category !== "artwork") {
    updates.imageAspect = null;
  }
  const [article] = await db
    .update(articlesTable)
    .set(updates)
    .where(eq(articlesTable.slug, paramsParsed.data.slug))
    .returning();
  if (!article) {
    sendApiError(
      res,
      404,
      "NOT_FOUND",
      "No article with that slug",
      "GET /api/articles to list slugs before updating",
    );
    return;
  }
  res.json({
    ...article,
    tags: article.tags ?? [],
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  });
});

router.delete("/articles/:slug", requireAdmin, async (req, res) => {
  const parsed = DeleteArticleParams.safeParse(req.params);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_PARAMS",
      "Invalid params",
      "Provide a string slug as documented in /openapi.json",
    );
    return;
  }
  await db.delete(articlesTable).where(eq(articlesTable.slug, parsed.data.slug));
  res.status(204).send();
});

export default router;
