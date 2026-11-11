import { Router } from "express";
import { db, articlesTable, categoriesTable, getSiteAccessCount, recordSiteAccess } from "@workspace/db";
import { sql } from "drizzle-orm";
import { ensureDefaultCategories } from "../lib/seed-categories";
import { logger } from "../lib/logger";

const ACCESS_COOKIE = "wiki_site_access";

const router = Router();

function accessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

router.get("/stats", async (req, res) => {
  await ensureDefaultCategories();
  const [{ totalArticles }] = await db
    .select({ totalArticles: sql<number>`count(*)::int` })
    .from(articlesTable);
  const [{ totalCategories }] = await db
    .select({ totalCategories: sql<number>`count(*)::int` })
    .from(categoriesTable);
  const [{ articleViews }] = await db
    .select({ articleViews: sql<number>`coalesce(sum(view_count), 0)::int` })
    .from(articlesTable);
  const siteAccesses = await getSiteAccessCount();
  const totalViews = articleViews + siteAccesses;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [{ recentEdits }] = await db
    .select({ recentEdits: sql<number>`count(*)::int` })
    .from(articlesTable)
    .where(sql`updated_at > ${oneWeekAgo}`);
  res.json({ totalArticles, totalCategories, totalViews, recentEdits });
});

router.post("/stats/visit", async (req, res) => {
  if (req.cookies?.[ACCESS_COOKIE] === "1") {
    res.json({ counted: false });
    return;
  }
  try {
    await recordSiteAccess();
    res.cookie(ACCESS_COOKIE, "1", accessCookieOptions());
    res.json({ counted: true });
  } catch (error) {
    logger.error({ err: error }, "Failed to record a site access");
    res.status(500).json({ counted: false });
  }
});

export default router;
