import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Plus, Swords, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createOpponent,
  deleteOpponent,
  listOpponents,
  logout,
  updateOpponent,
  type Opponent,
  type OpponentAttention,
  type OpponentOutcome,
  type OpponentUser,
} from "./api";
import { normalizePower } from "./power";

const OUTCOMES: Array<{ id: OpponentOutcome; label: string; hint: string }> = [
  { id: "won", label: "Derrotei", hint: "Vitória clara" },
  { id: "close", label: "Por pouco", hint: "Passei raspando" },
  { id: "lost", label: "Fui derrotado", hint: "Ele levou" },
];

const FILTERS: Array<{ id: "all" | OpponentOutcome; label: string }> = [
  { id: "all", label: "Todos" },
  ...OUTCOMES.map((outcome) => ({ id: outcome.id, label: outcome.label })),
];

type DraftStat = { key: string; name: string; value: string; attention: OpponentAttention };

function blankStat(): DraftStat {
  return { key: crypto.randomUUID(), name: "", value: "", attention: "reach" };
}

function showPower(value: string): string {
  return normalizePower(value) ?? value;
}

function outcomeLabel(outcome: OpponentOutcome): string {
  return OUTCOMES.find((item) => item.id === outcome)?.label ?? outcome;
}

export function OpponentPanel({ user, onLogout }: { user: OpponentUser; onLogout: () => void }) {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [totalPower, setTotalPower] = useState("");
  const [outcome, setOutcome] = useState<OpponentOutcome>("won");
  const [stats, setStats] = useState<DraftStat[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setOpponents(await listOpponents());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os oponentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () => opponents.filter((opponent) => filter === "all" || opponent.outcome === filter),
    [opponents, filter],
  );

  const counts = useMemo(() => {
    return {
      all: opponents.length,
      won: opponents.filter((opponent) => opponent.outcome === "won").length,
      close: opponents.filter((opponent) => opponent.outcome === "close").length,
      lost: opponents.filter((opponent) => opponent.outcome === "lost").length,
    };
  }, [opponents]);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setTotalPower("");
    setOutcome("won");
    setStats([]);
    setFormOpen(true);
    setError("");
  };

  const openEdit = (opponent: Opponent) => {
    setEditingId(opponent.id);
    setName(opponent.name);
    setTotalPower(showPower(opponent.totalPower));
    setOutcome(opponent.outcome);
    setStats(
      opponent.stats.map((stat) => ({
        key: stat.id,
        name: stat.name,
        value: stat.value,
        attention: stat.attention,
      })),
    );
    setFormOpen(true);
    setError("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const power = normalizePower(totalPower);
    if (!power) {
      setSaving(false);
      setError("Informe o poder, como 1,5b ou 2t.");
      return;
    }
    const draft = {
      name,
      totalPower: power,
      outcome,
      stats: stats
        .map((stat) => ({ name: stat.name.trim(), value: stat.value.trim(), attention: stat.attention }))
        .filter((stat) => stat.name || stat.value),
    };
    try {
      if (editingId) await updateOpponent(editingId, draft);
      else await createOpponent(draft);
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (opponent: Opponent) => {
    if (!window.confirm(`Excluir ${opponent.name} do painel?`)) return;
    setError("");
    try {
      await deleteOpponent(opponent.id);
      if (editingId === opponent.id) setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível excluir.");
    }
  };

  const signOut = async () => {
    await logout().catch(() => undefined);
    onLogout();
  };

  return (
    <div className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary flex items-center gap-3">
            <Swords className="h-8 w-8" /> Painel de Oponentes
          </h1>
          <p className="mt-1 text-muted-foreground">Conta {user.username}. Cada conta vê só os próprios oponentes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openCreate}>
            <Plus /> Registrar
          </Button>
          <Button variant="outline" asChild>
            <Link href="/ferramentas">Ferramentas</Link>
          </Button>
          <Button variant="ghost" onClick={() => void signOut()}>Sair</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label} {counts[item.id]}
          </Button>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {formOpen ? (
        <section className="rounded-2xl border border-primary/20 bg-card/60 p-4 md:p-6 space-y-4">
          <h2 className="font-serif text-xl text-primary">{editingId ? "Editar oponente" : "Novo oponente"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="opponent-name">Nome</Label>
              <Input id="opponent-name" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opponent-power">Poder total</Label>
              <Input
                id="opponent-power"
                inputMode="text"
                placeholder="1,5b"
                value={totalPower}
                onChange={(event) => setTotalPower(event.target.value)}
                onBlur={() => {
                  const power = normalizePower(totalPower);
                  if (power) setTotalPower(power);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Resultado</p>
            <div className="flex flex-wrap gap-2">
              {OUTCOMES.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={outcome === item.id ? "default" : "outline"}
                  onClick={() => setOutcome(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Status para alcançar ou vigiar</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setStats((current) => [...current, blankStat()])}>
                <Plus /> Status
              </Button>
            </div>
            {stats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum status ainda. Adicione o que você precisa alcançar ou tomar cuidado.</p>
            ) : (
              stats.map((stat) => (
                <div key={stat.key} className="grid gap-2 md:grid-cols-[1fr_8rem_auto_auto] md:items-center">
                  <Input
                    aria-label="Nome do status"
                    placeholder="Status"
                    maxLength={40}
                    value={stat.name}
                    onChange={(event) =>
                      setStats((current) => current.map((item) => item.key === stat.key ? { ...item, name: event.target.value } : item))
                    }
                  />
                  <Input
                    aria-label="Valor do status"
                    placeholder="Valor"
                    maxLength={40}
                    value={stat.value}
                    onChange={(event) =>
                      setStats((current) => current.map((item) => item.key === stat.key ? { ...item, value: event.target.value } : item))
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={stat.attention === "reach" ? "default" : "outline"}
                      onClick={() =>
                        setStats((current) => current.map((item) => item.key === stat.key ? { ...item, attention: "reach" } : item))
                      }
                    >
                      Alcançar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={stat.attention === "caution" ? "default" : "outline"}
                      onClick={() =>
                        setStats((current) => current.map((item) => item.key === stat.key ? { ...item, attention: "caution" } : item))
                      }
                    >
                      Cuidado
                    </Button>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Remover status"
                    onClick={() => setStats((current) => current.filter((item) => item.key !== stat.key))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={saving} onClick={() => void save()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
          </div>
        </section>
      ) : null}

      {loading ? (
        <p className="text-muted-foreground">Carregando oponentes...</p>
      ) : visible.length === 0 ? (
        <p className="text-muted-foreground">Nenhum oponente neste grupo.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((opponent) => {
            const reach = opponent.stats.filter((stat) => stat.attention === "reach");
            const caution = opponent.stats.filter((stat) => stat.attention === "caution");
            return (
              <article key={opponent.id} className="rounded-2xl border border-border/70 bg-card/50 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl text-primary">{opponent.name}</h2>
                    <p className="text-sm text-muted-foreground">Poder total {showPower(opponent.totalPower)}</p>
                  </div>
                  <span className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">
                    {outcomeLabel(opponent.outcome)}
                  </span>
                </div>
                {reach.length > 0 ? (
                  <StatList title="Alcançar" stats={reach} />
                ) : null}
                {caution.length > 0 ? (
                  <StatList title="Tomar cuidado" stats={caution} />
                ) : null}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(opponent)}>Editar</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void remove(opponent)}>Excluir</Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatList({ title, stats }: { title: string; stats: Opponent["stats"] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1 space-y-1">
        {stats.map((stat) => (
          <li key={stat.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span>{stat.name}</span>
            <span className="font-medium">{stat.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
