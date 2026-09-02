import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, ilike, or, sql, desc, and } from "drizzle-orm";
import {
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  UpdateArticleParams,
  UpdateArticleBody,
  DeleteArticleParams,
  ListRecentArticlesQueryParams,
  SearchArticlesQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/articles", async (req, res) => {
  const parsed = ListArticlesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
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
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, parsed.data.slug));
  if (!article) {
    res.status(404).json({ error: "Not found" });
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
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [article] = await db
    .insert(articlesTable)
    .values({ ...parsed.data, tags: parsed.data.tags ?? [] })
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
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updates = { ...bodyParsed.data, updatedAt: new Date() };
  const [article] = await db
    .update(articlesTable)
    .set(updates)
    .where(eq(articlesTable.slug, paramsParsed.data.slug))
    .returning();
  if (!article) {
    res.status(404).json({ error: "Not found" });
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
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db.delete(articlesTable).where(eq(articlesTable.slug, parsed.data.slug));
  res.status(204).send();
});

export default router;
