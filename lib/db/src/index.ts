import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: isServerless ? 1 : 5,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
export {
  loginUser,
  createSession,
  getUserBySession,
  deleteSession,
  deleteUserAccount,
  type AuthUser,
} from "./magites/auth";
export { getAppState, saveAppState } from "./magites/state";
export { parseAppState, loginCredentialsSchema, deleteAccountSchema } from "./magites/validation";
export { getSiteAccessCount, recordSiteAccess } from "./site-access";
export {
  OpponentUsernameTakenError,
  createOpponentSession,
  deleteOpponentSession,
  getOpponentBySession,
  loginOpponent,
  registerOpponentUser,
  type OpponentUser,
} from "./opponents/auth";
export { createOpponent, deleteOpponent, listOpponents, updateOpponent } from "./opponents/records";
export { opponentInputSchema, opponentLoginSchema } from "./opponents/validation";
