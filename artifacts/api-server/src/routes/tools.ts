import { Router } from "express";
import { db, toolsTable } from "@workspace/db";
import { asc, eq, sql } from "drizzle-orm";
import {
  CreateToolBody,
  DeleteToolParams,
  UpdateToolBody,
  UpdateToolParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { sendApiError } from "../lib/json-error";

const router = Router();

function serializeTool(tool: typeof toolsTable.$inferSelect) {
  return {
    ...tool,
    createdAt: tool.createdAt.toISOString(),
    updatedAt: tool.updatedAt.toISOString(),
  };
}

router.get("/tools", async (_req, res) => {
  const tools = await db
    .select()
    .from(toolsTable)
    .orderBy(asc(toolsTable.sortOrder), asc(toolsTable.id));
  res.json(tools.map(serializeTool));
});

router.post("/tools", requireAdmin, async (req, res) => {
  const parsed = CreateToolBody.safeParse(req.body);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_BODY",
      "Invalid body",
      "Send ToolInput JSON as documented in /openapi.json",
    );
    return;
  }

  const href = parsed.data.href.trim();
  const external = parsed.data.external ?? /^https?:\/\//i.test(href);

  let sortOrder = parsed.data.sortOrder;
  if (sortOrder === undefined) {
    const [row] = await db
      .select({ max: sql<number>`coalesce(max(${toolsTable.sortOrder}), -1)` })
      .from(toolsTable);
    sortOrder = Number(row?.max ?? -1) + 1;
  }

  const [tool] = await db
    .insert(toolsTable)
    .values({
      name: parsed.data.name.trim(),
      description: parsed.data.description ?? "",
      href,
      external,
      sortOrder,
    })
    .returning();

  res.status(201).json(serializeTool(tool));
});

router.put("/tools/:id", requireAdmin, async (req, res) => {
  const paramsParsed = UpdateToolParams.safeParse(req.params);
  const bodyParsed = UpdateToolBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_REQUEST",
      "Invalid request",
      "Check id and ToolUpdate fields in /openapi.json",
    );
    return;
  }

  const updates: Partial<typeof toolsTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (bodyParsed.data.name !== undefined) updates.name = bodyParsed.data.name.trim();
  if (bodyParsed.data.description !== undefined) updates.description = bodyParsed.data.description;
  if (bodyParsed.data.href !== undefined) {
    updates.href = bodyParsed.data.href.trim();
    if (bodyParsed.data.external === undefined) {
      updates.external = /^https?:\/\//i.test(updates.href);
    }
  }
  if (bodyParsed.data.external !== undefined) updates.external = bodyParsed.data.external;
  if (bodyParsed.data.sortOrder !== undefined) updates.sortOrder = bodyParsed.data.sortOrder;

  const [tool] = await db
    .update(toolsTable)
    .set(updates)
    .where(eq(toolsTable.id, paramsParsed.data.id))
    .returning();

  if (!tool) {
    sendApiError(
      res,
      404,
      "NOT_FOUND",
      "No tool with that id",
      "GET /api/tools to list ids",
    );
    return;
  }
  res.json(serializeTool(tool));
});

router.delete("/tools/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteToolParams.safeParse(req.params);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "INVALID_PARAMS",
      "Invalid params",
      "Provide a numeric tool id as documented in /openapi.json",
    );
    return;
  }
  await db.delete(toolsTable).where(eq(toolsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
