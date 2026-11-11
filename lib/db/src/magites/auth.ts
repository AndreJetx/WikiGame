import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { appSessions, appUsers, scenarios } from "./schema";

const scryptAsync = promisify(scrypt);
const SESSION_DAYS = 30;

export interface AuthUser {
  id: string;
  username: string;
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const actual = Buffer.from(hash, "hex");
  if (derived.length !== actual.length) return false;
  return timingSafeEqual(derived, actual);
}

export async function loginUser(username: string, password: string): Promise<AuthUser | null> {
  const normalized = normalizeUsername(username);
  const [row] = await db.select().from(appUsers).where(eq(appUsers.username, normalized)).limit(1);
  if (!row) return null;
  const ok = await verifyPassword(password, row.passwordHash);
  if (!ok) return null;
  return { id: row.id, username: row.username };
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(appSessions).values({ token, userId, expiresAt });
  return token;
}

export async function getUserBySession(token: string): Promise<AuthUser | null> {
  if (!token) return null;
  const [row] = await db
    .select({
      id: appUsers.id,
      username: appUsers.username,
      expiresAt: appSessions.expiresAt,
    })
    .from(appSessions)
    .innerJoin(appUsers, eq(appSessions.userId, appUsers.id))
    .where(eq(appSessions.token, token))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(appSessions).where(eq(appSessions.token, token));
    return null;
  }
  return { id: row.id, username: row.username };
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  await db.delete(appSessions).where(eq(appSessions.token, token));
}

export async function deleteUserAccount(userId: string): Promise<void> {
  if (!userId) return;
  await db.transaction(async (tx) => {
    await tx.delete(scenarios).where(eq(scenarios.userId, userId));
    await tx.delete(appUsers).where(eq(appUsers.id, userId));
  });
}
