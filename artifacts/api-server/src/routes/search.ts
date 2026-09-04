import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { ilike, or, eq, and, desc } from "drizzle-orm";
import { SearchArticlesQueryParams } from "@workspace/api-zod";
import { sendApiError } from "../lib/json-error";

const router = Router();

router.get("/search", async (req, res) => {
  const parsed = SearchArticlesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_PARAMS",
      "Invalid query params",
      "Pass required q and optional category as documented in /openapi.json",
    );
    return;
  }
  const { q, category } = parsed.data;
  const textFilter = or(
    ilike(articlesTable.title, `%${q}%`),
    ilike(articlesTable.excerpt, `%${q}%`),
    ilike(articlesTable.content, `%${q}%`)
  );
  const filter = category ? and(textFilter, eq(articlesTable.category, category)) : textFilter;
  const articles = await db
    .select()
    .from(articlesTable)
    .where(filter)
    .orderBy(desc(articlesTable.viewCount))
    .limit(20);
  res.json(
    articles.map((a) => ({
      ...a,
      tags: a.tags ?? [],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }))
  );
});

export default router;
