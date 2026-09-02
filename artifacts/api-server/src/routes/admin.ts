import { Router } from "express";
import {
  clearAdminCookie,
  getAdminPassword,
  isAdminRequest,
  passwordsMatch,
  setAdminCookie,
} from "../lib/admin-auth";

const router = Router();

router.get("/admin/session", (req, res) => {
  res.json({ authenticated: Boolean(getAdminPassword() && isAdminRequest(req)) });
});

router.post("/admin/login", (req, res) => {
  const expected = getAdminPassword();
  if (!expected) {
    res.status(503).json({ error: "Admin password is not configured" });
    return;
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password || !passwordsMatch(password, expected)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  setAdminCookie(res);
  res.json({ ok: true });
});

router.post("/admin/logout", (_req, res) => {
  clearAdminCookie(res);
  res.json({ ok: true });
});

export default router;
