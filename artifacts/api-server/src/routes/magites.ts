import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import {
  createSession,
  deleteAccountSchema,
  deleteSession,
  deleteUserAccount,
  getAppState,
  getUserBySession,
  loginCredentialsSchema,
  loginUser,
  parseAppState,
  saveAppState,
  type AuthUser,
} from "@workspace/db";
import { logger } from "../lib/logger";

const SESSION_COOKIE = "magite_session";

type AuthedRequest = Request & { user: AuthUser };

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function readToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;
  return bearer || (req.cookies?.[SESSION_COOKIE] as string | undefined);
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  const user = token ? await getUserBySession(token) : null;
  if (!user) {
    res.status(401).json({ error: "Faça login para continuar." });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
}

const router: IRouter = Router();

router.post("/magites/auth/login", async (req, res) => {
  const parsed = loginCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    return;
  }

  try {
    const user = await loginUser(parsed.data.username, parsed.data.password);
    if (!user) {
      res.status(401).json({ error: "Nome de usuário ou senha incorretos." });
      return;
    }
    const token = await createSession(user.id);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.json({ ...user, token });
  } catch (error) {
    logger.error({ err: error }, "Failed to login to Controle de Magites");
    res.status(500).json({ error: "Não foi possível entrar." });
  }
});

router.post("/magites/auth/logout", async (req, res) => {
  const token = readToken(req);
  if (token) await deleteSession(token);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.json({ ok: true });
});

router.get("/magites/auth/me", requireAuth, (req, res) => {
  res.json((req as AuthedRequest).user);
});

router.post("/magites/auth/account/delete", requireAuth, async (req, res) => {
  const parsed = deleteAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    return;
  }

  const { id } = (req as AuthedRequest).user;
  try {
    await deleteUserAccount(id);
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, userId: id }, "Failed to delete Controle de Magites account");
    res.status(500).json({ error: "Não foi possível excluir a conta." });
  }
});

router.get("/magites/state", requireAuth, async (req, res) => {
  const { id, username } = (req as AuthedRequest).user;
  try {
    const state = await getAppState(id, username);
    res.json(state);
  } catch (error) {
    logger.error({ err: error }, "Failed to load Controle de Magites state");
    res.status(500).json({ error: "Falha ao carregar cenários do banco." });
  }
});

router.put("/magites/state", requireAuth, async (req, res) => {
  const parsed = parseAppState(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Estado inválido." });
    return;
  }

  try {
    const { id, username } = (req as AuthedRequest).user;
    await saveAppState(id, parsed.data);
    logger.info(
      { userId: id, username, scenarioCount: parsed.data.scenarios.length },
      "Saved Controle de Magites state",
    );
    res.json(parsed.data);
  } catch (error) {
    logger.error({ err: error }, "Failed to save Controle de Magites state");
    res.status(500).json({ error: "Falha ao salvar cenários no banco." });
  }
});

export default router;
