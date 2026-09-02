export async function fetchAdminSession(): Promise<boolean> {
  const res = await fetch("/api/admin/session", { credentials: "same-origin" });
  if (!res.ok) return false;
  const data = (await res.json()) as { authenticated?: boolean };
  return Boolean(data.authenticated);
}

export async function loginAdmin(password: string): Promise<{ ok: true } | { ok: false; status: number }> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "same-origin",
  });
}
