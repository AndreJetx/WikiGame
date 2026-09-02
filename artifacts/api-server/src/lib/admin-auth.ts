import { timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

export const ADMIN_COOKIE = "wiki_admin_session";
const ADMIN_COOKIE_VALUE = "ok";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function getAdminPassword(): string | undefined {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value || undefined;
}

export function getCookieSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "wiki-admin-cookie"
  );
}

export function passwordsMatch(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isAdminRequest(req: Request): boolean {
  return req.signedCookies?.[ADMIN_COOKIE] === ADMIN_COOKIE_VALUE;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    signed: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
    path: "/",
    maxAge: WEEK_MS,
  };
}

export function setAdminCookie(res: Response) {
  res.cookie(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, cookieOptions());
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
    path: "/",
  });
}
