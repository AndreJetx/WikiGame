import type { Request, Response, NextFunction } from "express";
import { getAdminPassword, isAdminRequest } from "../lib/admin-auth";
import { sendApiError } from "../lib/json-error";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!getAdminPassword()) {
    sendApiError(
      res,
      503,
      "ADMIN_NOT_CONFIGURED",
      "Admin password is not configured",
      "Set ADMIN_PASSWORD on the server or use public GET endpoints only",
    );
    return;
  }
  if (!isAdminRequest(req)) {
    sendApiError(
      res,
      401,
      "UNAUTHORIZED",
      "Admin session required",
      "POST /api/admin/login with { password } then retry with the wiki_admin_session cookie",
    );
    return;
  }
  next();
}
