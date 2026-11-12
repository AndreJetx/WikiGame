import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import {
  OpponentUsernameTakenError,
  registerOpponentUser,
  createOpponent,
  createOpponentSession,
  deleteOpponent,
  deleteOpponentSession,
  getOpponentBySession,
  listOpponents,
  loginOpponent,
  opponentInputSchema,
  opponentLoginSchema,
  updateOpponent,
  type OpponentUser,
} from "@workspace/db";
import { logger } from "../lib/logger";

const SESSION_COOKIE = "opponent_session";

type AuthedRequest = Request & { user: OpponentUser };

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function routeId(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function readToken(req: Request): string | undefined {
  return req.cookies?.[SESSION_COOKIE] as string | undefined;
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  const user = token ? await getOpponentBySession(token) : null;
  if (!user) {
    res.status(401).json({ error: "Faça login para continuar." });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
}

const router: IRouter = Router();

router.post("/opponents/auth/register", async (req, res) => {
  const parsed = opponentLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    return;
  }
  try {
    const user = await registerOpponentUser(parsed.data.username, parsed.data.password);
    const token = await createOpponentSession(user.id);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof OpponentUsernameTakenError) {
      res.status(409).json({ error: "Esse usuário já existe neste painel." });
      return;
    }
    logger.error({ err: error }, "Failed to create an opponent panel account");
    res.status(500).json({ error: "Não foi possível criar a conta." });
  }
});

router.post("/opponents/auth/login", async (req, res) => {
  const parsed = opponentLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    return;
  }
  try {
    const user = await loginOpponent(parsed.data.username, parsed.data.password);
    if (!user) {
      res.status(401).json({ error: "Nome de usuário ou senha incorretos." });
      return;
    }
    const token = await createOpponentSession(user.id);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.json(user);
  } catch (error) {
    logger.error({ err: error }, "Failed to login to the opponent panel");
    res.status(500).json({ error: "Não foi possível entrar." });
  }
});

router.post("/opponents/auth/logout", async (req, res) => {
  const token = readToken(req);
  if (token) await deleteOpponentSession(token);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.json({ ok: true });
});

router.get("/opponents/auth/me", requireAuth, (req, res) => {
  res.json((req as AuthedRequest).user);
});

router.get("/opponents", requireAuth, async (req, res) => {
  try {
    res.json(await listOpponents((req as AuthedRequest).user.id));
  } catch (error) {
    logger.error({ err: error }, "Failed to list opponents");
    res.status(500).json({ error: "Não foi possível carregar os oponentes." });
  }
});

router.post("/opponents", requireAuth, async (req, res) => {
  const parsed = opponentInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    return;
  }
  try {
    const id = await createOpponent((req as AuthedRequest).user.id, parsed.data);
    const opponents = await listOpponents((req as AuthedRequest).user.id);
    res.status(201).json(opponents.find((opponent) => opponent.id === id) ?? null);
  } catch (error) {
    logger.error({ err: error }, "Failed to create an opponent");
    res.status(500).json({ error: "Não foi possível registrar o oponente." });
  }
});

router.put("/opponents/:id", requireAuth, async (req, res) => {
  const parsed = opponentInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    return;
  }
  try {
    const updated = await updateOpponent((req as AuthedRequest).user.id, routeId(req.params.id), parsed.data);
    if (!updated) {
      res.status(404).json({ error: "Oponente não encontrado." });
      return;
    }
    const opponents = await listOpponents((req as AuthedRequest).user.id);
    res.json(opponents.find((opponent) => opponent.id === routeId(req.params.id)) ?? null);
  } catch (error) {
    logger.error({ err: error }, "Failed to update an opponent");
    res.status(500).json({ error: "Não foi possível salvar o oponente." });
  }
});

router.delete("/opponents/:id", requireAuth, async (req, res) => {
  try {
    const removed = await deleteOpponent((req as AuthedRequest).user.id, routeId(req.params.id));
    if (!removed) {
      res.status(404).json({ error: "Oponente não encontrado." });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete an opponent");
    res.status(500).json({ error: "Não foi possível excluir o oponente." });
  }
});

export default router;
