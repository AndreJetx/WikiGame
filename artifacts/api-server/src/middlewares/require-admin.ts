import type { Request, Response, NextFunction } from "express";
import { getAdminPassword, isAdminRequest } from "../lib/admin-auth";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!getAdminPassword()) {
    res.status(503).json({ error: "Admin password is not configured" });
    return;
  }
  if (!isAdminRequest(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
