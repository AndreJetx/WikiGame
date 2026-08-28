import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { WikiLogo } from "./wiki-logo";
import { SidebarNav } from "./sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

function MobileWikiMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 -ml-2"
          aria-label="Abrir menu da wiki"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-card border-border">
        <SheetHeader className="px-4 py-4 pr-12 border-b border-border text-left">
          <SheetTitle className="font-serif text-primary">Menu</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-4.5rem)] overflow-y-auto p-4">
          <SidebarNav />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[4.5rem] max-w-screen-2xl items-center px-4 md:px-8">
        <div className="mr-2 md:mr-4 flex min-w-0 items-center">
          <MobileWikiMenu />
          <Link href="/" className="mr-2 md:mr-6 flex items-center shrink-0">
            <WikiLogo />
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full min-w-0 flex-1 md:w-auto md:flex-none">
            <Link href="/search">
              <Button variant="outline" className="w-full justify-start text-muted-foreground md:w-64" size="sm">
                <Search className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Pesquisar na wiki...</span>
              </Button>
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
