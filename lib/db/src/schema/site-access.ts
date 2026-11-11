import { integer } from "drizzle-orm/pg-core";
import { wikiSchema } from "./articles";

export const siteAccessTable = wikiSchema.table("site_access", {
  id: integer("id").primaryKey(),
  count: integer("count").notNull().default(0),
});
