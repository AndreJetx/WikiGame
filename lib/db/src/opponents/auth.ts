import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { opponentSessions, opponentUsers } from "../schema/opponents";
import { ensureOpponentTables } from "./ensure";

const scryptAsync = promisify(scrypt);
const SESSION_DAYS = 30;

export interface OpponentUser {
  id: string;
  username: string;
}

export class OpponentUsernameTakenError extends Error {
  constructor() {
    super("Esse usuário já existe neste painel.");
  }
}

function isUniqueViolation(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    if ("code" in current && (current as { code?: string }).code === "23505") return true;
    current = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }
  return false;
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const actual = Buffer.from(hash, "hex");
  if (derived.length !== actual.length) return false;
  return timingSafeEqual(derived, actual);
}

export async function registerOpponentUser(username: string, password: string): Promise<OpponentUser> {
  await ensureOpponentTables();
  const normalized = normalizeUsername(username);
  const id = randomBytes(12).toString("hex");
  try {
    await db.insert(opponentUsers).values({
      id,
      username: normalized,
      passwordHash: await hashPassword(password),
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new OpponentUsernameTakenError();
    throw error;
  }
  return { id, username: normalized };
}

export async function loginOpponent(username: string, password: string): Promise<OpponentUser | null> {
  await ensureOpponentTables();
  const normalized = normalizeUsername(username);
  const [row] = await db.select().from(opponentUsers).where(eq(opponentUsers.username, normalized)).limit(1);
  if (!row) return null;
  const ok = await verifyPassword(password, row.passwordHash);
  if (!ok) return null;
  return { id: row.id, username: row.username };
}

export async function createOpponentSession(userId: string): Promise<string> {
  await ensureOpponentTables();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(opponentSessions).values({ token, userId, expiresAt });
  return token;
}

export async function getOpponentBySession(token: string): Promise<OpponentUser | null> {
  if (!token) return null;
  await ensureOpponentTables();
  const [row] = await db
    .select({
      id: opponentUsers.id,
      username: opponentUsers.username,
      expiresAt: opponentSessions.expiresAt,
    })
    .from(opponentSessions)
    .innerJoin(opponentUsers, eq(opponentSessions.userId, opponentUsers.id))
    .where(eq(opponentSessions.token, token))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(opponentSessions).where(eq(opponentSessions.token, token));
    return null;
  }
  return { id: row.id, username: row.username };
}

export async function deleteOpponentSession(token: string): Promise<void> {
  if (!token) return;
  await ensureOpponentTables();
  await db.delete(opponentSessions).where(eq(opponentSessions.token, token));
}
