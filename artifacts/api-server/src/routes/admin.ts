import { Router } from "express";
import {
  clearAdminCookie,
  getAdminPassword,
  isAdminRequest,
  passwordsMatch,
  setAdminCookie,
} from "../lib/admin-auth";
import { sendApiError } from "../lib/json-error";

const router = Router();

router.get("/admin/session", (req, res) => {
  res.json({ authenticated: Boolean(getAdminPassword() && isAdminRequest(req)) });
});

router.post("/admin/login", (req, res) => {
  const expected = getAdminPassword();
  if (!expected) {
    sendApiError(
      res,
      503,
      "ADMIN_NOT_CONFIGURED",
      "Admin password is not configured",
      "Set ADMIN_PASSWORD on the server or use public GET endpoints only",
    );
    return;
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password || !passwordsMatch(password, expected)) {
    sendApiError(
      res,
      401,
      "INVALID_PASSWORD",
      "Invalid password",
      "Send JSON { password } to POST /api/admin/login",
    );
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
