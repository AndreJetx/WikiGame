import { pool } from "../index";

let ready: Promise<void> | null = null;

export function ensureOpponentTables(): Promise<void> {
  ready ??= pool
    .query(`
      CREATE TABLE IF NOT EXISTS wiki.opponent_users (
        id text PRIMARY KEY,
        username text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS wiki.opponent_sessions (
        token text PRIMARY KEY,
        user_id text NOT NULL REFERENCES wiki.opponent_users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS wiki.opponent_records (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES wiki.opponent_users(id) ON DELETE CASCADE,
        name text NOT NULL,
        total_power text NOT NULL,
        outcome text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS wiki.opponent_stats (
        id text PRIMARY KEY,
        opponent_id text NOT NULL REFERENCES wiki.opponent_records(id) ON DELETE CASCADE,
        name text NOT NULL,
        value text NOT NULL,
        attention text NOT NULL,
        sort_order integer NOT NULL DEFAULT 0
      );
    `)
    .then(() => undefined);
  return ready;
}
