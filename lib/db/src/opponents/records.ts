import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "../index";
import { opponentRecords, opponentStats } from "../schema/opponents";
import { ensureOpponentTables } from "./ensure";
import type { OpponentInput } from "./validation";

export interface OpponentStatRecord {
  id: string;
  name: string;
  value: string;
  attention: "reach" | "caution";
}

export interface OpponentRecord {
  id: string;
  name: string;
  totalPower: string;
  outcome: "won" | "close" | "lost";
  stats: OpponentStatRecord[];
  createdAt: string;
  updatedAt: string;
}

function newId(): string {
  return randomBytes(12).toString("hex");
}

function asOutcome(value: string): OpponentRecord["outcome"] {
  if (value === "won" || value === "close" || value === "lost") return value;
  return "lost";
}

function asAttention(value: string): OpponentStatRecord["attention"] {
  return value === "caution" ? "caution" : "reach";
}

export async function listOpponents(userId: string): Promise<OpponentRecord[]> {
  await ensureOpponentTables();
  const rows = await db
    .select()
    .from(opponentRecords)
    .where(eq(opponentRecords.userId, userId))
    .orderBy(desc(opponentRecords.updatedAt));
  if (rows.length === 0) return [];

  const stats = await db
    .select()
    .from(opponentStats)
    .where(inArray(opponentStats.opponentId, rows.map((row) => row.id)))
    .orderBy(asc(opponentStats.sortOrder));
  const byOpponent = new Map<string, OpponentStatRecord[]>();
  for (const stat of stats) {
    const list = byOpponent.get(stat.opponentId) ?? [];
    list.push({
      id: stat.id,
      name: stat.name,
      value: stat.value,
      attention: asAttention(stat.attention),
    });
    byOpponent.set(stat.opponentId, list);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    totalPower: row.totalPower,
    outcome: asOutcome(row.outcome),
    stats: byOpponent.get(row.id) ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

async function replaceStats(opponentId: string, stats: OpponentInput["stats"]): Promise<void> {
  await db.delete(opponentStats).where(eq(opponentStats.opponentId, opponentId));
  if (stats.length === 0) return;
  await db.insert(opponentStats).values(
    stats.map((stat, index) => ({
      id: newId(),
      opponentId,
      name: stat.name,
      value: stat.value,
      attention: stat.attention,
      sortOrder: index,
    })),
  );
}

export async function createOpponent(userId: string, input: OpponentInput): Promise<string> {
  await ensureOpponentTables();
  const id = newId();
  const now = new Date();
  await db.insert(opponentRecords).values({
    id,
    userId,
    name: input.name,
    totalPower: input.totalPower,
    outcome: input.outcome,
    createdAt: now,
    updatedAt: now,
  });
  await replaceStats(id, input.stats);
  return id;
}

export async function updateOpponent(userId: string, opponentId: string, input: OpponentInput): Promise<boolean> {
  await ensureOpponentTables();
  const [owned] = await db
    .select({ id: opponentRecords.id })
    .from(opponentRecords)
    .where(and(eq(opponentRecords.id, opponentId), eq(opponentRecords.userId, userId)))
    .limit(1);
  if (!owned) return false;
  await db
    .update(opponentRecords)
    .set({
      name: input.name,
      totalPower: input.totalPower,
      outcome: input.outcome,
      updatedAt: new Date(),
    })
    .where(eq(opponentRecords.id, opponentId));
  await replaceStats(opponentId, input.stats);
  return true;
}

export async function deleteOpponent(userId: string, opponentId: string): Promise<boolean> {
  await ensureOpponentTables();
  const [owned] = await db
    .select({ id: opponentRecords.id })
    .from(opponentRecords)
    .where(and(eq(opponentRecords.id, opponentId), eq(opponentRecords.userId, userId)))
    .limit(1);
  if (!owned) return false;
  await db.delete(opponentRecords).where(eq(opponentRecords.id, opponentId));
  return true;
}
