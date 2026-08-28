import { Router } from "express";
import { db, articlesTable, categoriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { ensureDefaultCategories } from "../lib/seed-categories";

const router = Router();

router.get("/categories", async (_req, res) => {
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
  res.json(
    cats.map((cat) => ({
      ...cat,
      articleCount: countMap.get(cat.slug) ?? 0,
    })),
  );
});

export default router;
