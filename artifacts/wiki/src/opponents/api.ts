export interface OpponentUser {
  id: string;
  username: string;
}

export type OpponentOutcome = "won" | "close" | "lost";
export type OpponentAttention = "reach" | "caution";

export interface OpponentStat {
  id: string;
  name: string;
  value: string;
  attention: OpponentAttention;
}

export interface Opponent {
  id: string;
  name: string;
  totalPower: string;
  outcome: OpponentOutcome;
  stats: OpponentStat[];
  createdAt: string;
  updatedAt: string;
}

export interface OpponentDraft {
  name: string;
  totalPower: string;
  outcome: OpponentOutcome;
  stats: Array<{ name: string; value: string; attention: OpponentAttention }>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/opponents${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Não foi possível concluir.");
  return data as T;
}

export function registerAccount(username: string, password: string): Promise<OpponentUser> {
  return request("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) });
}

export function login(username: string, password: string): Promise<OpponentUser> {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
}

export function logout(): Promise<{ ok: boolean }> {
  return request("/auth/logout", { method: "POST" });
}

export async function currentUser(): Promise<OpponentUser | null> {
  const res = await fetch("/api/opponents/auth/me", { credentials: "same-origin" });
  if (res.status === 401) return null;
  const data = (await res.json().catch(() => ({}))) as OpponentUser & { error?: string };
  if (!res.ok) throw new Error(data.error || "Não foi possível verificar a sessão.");
  return data;
}

export function listOpponents(): Promise<Opponent[]> {
  return request("");
}

export function createOpponent(draft: OpponentDraft): Promise<Opponent> {
  return request("", { method: "POST", body: JSON.stringify(draft) });
}

export function updateOpponent(id: string, draft: OpponentDraft): Promise<Opponent> {
  return request(`/${id}`, { method: "PUT", body: JSON.stringify(draft) });
}

export function deleteOpponent(id: string): Promise<{ ok: boolean }> {
  return request(`/${id}`, { method: "DELETE" });
}
