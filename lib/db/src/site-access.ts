import { eq, sql } from "drizzle-orm";
import { db, pool } from "./index";
import { siteAccessTable } from "./schema/site-access";

let ready: Promise<void> | null = null;

function ensureSiteAccessTable() {
  ready ??= pool
    .query(
      `CREATE TABLE IF NOT EXISTS wiki.site_access (
        id integer PRIMARY KEY,
        count integer NOT NULL DEFAULT 0
      )`,
    )
    .then(() => undefined);
  return ready;
}

export async function getSiteAccessCount(): Promise<number> {
  await ensureSiteAccessTable();
  const [row] = await db
    .select({ count: siteAccessTable.count })
    .from(siteAccessTable)
    .where(eq(siteAccessTable.id, 1));
  return Number(row?.count ?? 0);
}

export async function recordSiteAccess(): Promise<number> {
  await ensureSiteAccessTable();
  const [row] = await db
    .insert(siteAccessTable)
    .values({ id: 1, count: 1 })
    .onConflictDoUpdate({
      target: siteAccessTable.id,
      set: { count: sql`${siteAccessTable.count} + 1` },
    })
    .returning({ count: siteAccessTable.count });
  return Number(row?.count ?? 0);
}
