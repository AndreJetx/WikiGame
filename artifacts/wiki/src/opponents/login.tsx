import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, registerAccount, type OpponentUser } from "./api";

export function OpponentLogin({ onLoggedIn }: { onLoggedIn: (user: OpponentUser) => void }) {
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = creating
        ? await registerAccount(username, password)
        : await login(username, password);
      onLoggedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={submit} className="rounded-2xl border border-primary/20 bg-card/70 p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
            <Swords className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">Painel de Oponentes</h1>
            <p className="text-sm text-muted-foreground">Nome, poder e status dos oponentes</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {creating
            ? "Cada pessoa cria a própria conta. Os oponentes ficam só nela."
            : "Entre com a sua conta. Os oponentes ficam só nela."}
        </p>
        <div className="space-y-2">
          <Label htmlFor="opponent-username">Usuário</Label>
          <Input
            id="opponent-username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            minLength={3}
            maxLength={32}
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opponent-password">Senha</Label>
          <Input
            id="opponent-password"
            type="password"
            autoComplete={creating ? "new-password" : "current-password"}
            required
            minLength={6}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Aguarde..." : creating ? "Criar conta" : "Entrar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setCreating((current) => !current);
            setError("");
          }}
        >
          {creating ? "Já tenho conta" : "Criar conta"}
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/ferramentas">Voltar às ferramentas</Link>
        </Button>
      </form>
    </div>
  );
}
