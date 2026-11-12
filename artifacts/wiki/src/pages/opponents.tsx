import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Sidebar } from "@/components/sidebar";
import { currentUser, type OpponentUser } from "@/opponents/api";
import { OpponentLogin } from "@/opponents/login";
import { OpponentPanel } from "@/opponents/panel";

export function OpponentsPage() {
  const [user, setUser] = useState<OpponentUser | null | undefined>(undefined);

  useEffect(() => {
    const previous = document.title;
    document.title = "Painel de Oponentes";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    currentUser()
      .then((next) => {
        if (!cancelled) setUser(next);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout withSidebar>
      <Sidebar />
      {user === undefined ? (
        <div className="flex-1 p-8 text-muted-foreground">Carregando...</div>
      ) : user ? (
        <OpponentPanel user={user} onLogout={() => setUser(null)} />
      ) : (
        <div className="flex-1 p-4 md:p-8">
          <OpponentLogin onLoggedIn={setUser} />
        </div>
      )}
    </Layout>
  );
}
