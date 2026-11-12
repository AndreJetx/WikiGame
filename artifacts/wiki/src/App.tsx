import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getGetWikiStatsQueryKey } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/home";
import { Category } from "@/pages/category";
import { Article } from "@/pages/article";
import { Search } from "@/pages/search";
import { Admin } from "@/pages/admin";
import { Play } from "@/pages/play";
import { Tools } from "@/pages/tools";
import { MagitePage } from "@/pages/magite";
import { OpponentsPage } from "@/pages/opponents";
import { About } from "@/pages/about";
import { Contact } from "@/pages/contact";
import { Privacy } from "@/pages/privacy";
import { Docs } from "@/pages/docs";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wiki">
        <Redirect to="/" />
      </Route>
      <Route path="/search" component={Search} />
      <Route path="/iniciar-jornada" component={Play} />
      <Route path="/ferramentas" component={Tools} />
      <Route path="/ferramentas/controle-de-magites" component={MagitePage} />
      <Route path="/ferramentas/painel-de-oponentes" component={OpponentsPage} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/docs" component={Docs} />
      <Route path="/gerenciamentoartigos" component={Admin} />
      <Route path="/admin">
        <Redirect to="/gerenciamentoartigos" />
      </Route>
      <Route path="/wiki/:category/:slug" component={Article} />
      <Route path="/wiki/:category" component={Category} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const storageKey = "wiki_site_access_sent";
    if (sessionStorage.getItem(storageKey) === "1") return;
    sessionStorage.setItem(storageKey, "1");
    void fetch("/api/stats/visit", { method: "POST", credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { counted?: boolean };
        if (body.counted) {
          await queryClient.invalidateQueries({ queryKey: getGetWikiStatsQueryKey() });
        }
      })
      .catch(() => {
        sessionStorage.removeItem(storageKey);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
