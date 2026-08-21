import { Router } from "express";
import { db, articlesTable, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (req, res) => {
  const cats = await db.select().from(categoriesTable);
  const result = await Promise.all(
    cats.map(async (cat) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(articlesTable)
        .where(eq(articlesTable.category, cat.slug));
      return { ...cat, articleCount: count };
    })
  );
  res.json(result);
});

export default router;
