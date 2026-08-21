import { Router } from "express";
import { db, articlesTable, categoriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
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
  res.json({ totalArticles, totalCategories, totalViews, recentEdits });
});

export default router;
