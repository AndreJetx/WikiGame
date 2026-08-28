import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type WikiTableCell = {
  html: string;
  text: string;
};

type WikiTableData = {
  headers: string[];
  rows: WikiTableCell[][];
};

type ArticleBlock =
  | { type: "html"; html: string }
  | { type: "table"; table: WikiTableData };

function cellText(cell: Element) {
  return (cell.textContent || "").replace(/\s+/g, " ").trim();
}

function cellTitle(cell: WikiTableCell | undefined, fallback: string) {
  if (!cell) return fallback;
  const holder = document.createElement("div");
  holder.innerHTML = cell.html;
  const firstBlock = holder.querySelector("p, h1, h2, h3, h4, strong");
  if (firstBlock) {
    const firstLine = firstBlock.innerHTML
      .split(/<br\s*\/?>/i)[0]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (firstLine) return firstLine;
  }
  const alt = holder.querySelector("img")?.getAttribute("alt")?.trim();
  if (alt) return alt;
  return cell.text || fallback;
}

function topLevelTables(root: ParentNode) {
  return [...root.querySelectorAll("table")].filter(
    (table) => !table.parentElement?.closest("table"),
  );
}

function parseTable(table: HTMLTableElement): WikiTableData {
  const rows = [
    ...table.querySelectorAll(":scope > thead > tr, :scope > tbody > tr, :scope > tr"),
  ];
  if (!rows.length) return { headers: [], rows: [] };

  const firstCells = [...rows[0].cells];
  const hasHeader = firstCells.some((cell) => cell.tagName === "TH");
  const headers = hasHeader
    ? firstCells.map((cell) => cellText(cell))
    : firstCells.map((_, index) => (index === 0 ? "" : `Coluna ${index + 1}`));
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return {
    headers,
    rows: dataRows.map((row) =>
      [...row.cells].map((cell) => ({
        html: cell.innerHTML,
        text: cellText(cell),
      })),
    ),
  };
}

export function parseArticleBlocks(html: string): ArticleBlock[] {
  if (!html) return [];
  const container = document.createElement("div");
  container.innerHTML = html;
  const tables = topLevelTables(container);
  if (!tables.length) return [{ type: "html", html }];

  const parsedTables = tables.map((table) => parseTable(table));
  tables.forEach((table, index) => {
    const marker = document.createElement("div");
    marker.setAttribute("data-wiki-table-split", String(index));
    table.replaceWith(marker);
  });

  const blocks: ArticleBlock[] = [];
  const pieces = container.innerHTML.split(/<div[^>]*data-wiki-table-split="(\d+)"[^>]*>\s*<\/div>/i);
  pieces.forEach((piece, index) => {
    if (index % 2 === 1) {
      const table = parsedTables[Number(piece)];
      if (table?.rows.length) blocks.push({ type: "table", table });
      return;
    }
    if (piece.trim()) blocks.push({ type: "html", html: piece });
  });
  return blocks;
}

const LAYOUT_KEY = "wiki-table-layout";
type GalleryLayout = "grid" | "stack";

function readGalleryLayout(): GalleryLayout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "stack" ? "stack" : "grid";
  } catch {
    return "grid";
  }
}

function useGalleryLayout() {
  const [layout, setLayout] = useState<GalleryLayout>(readGalleryLayout);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const choose = (next: GalleryLayout) => {
    setLayout(next);
    try {
      localStorage.setItem(LAYOUT_KEY, next);
    } catch {
      // Ignore quota / private mode failures.
    }
  };

  return { layout, choose, isMobile, showStack: isMobile && layout === "stack" };
}

function WikiCardList({
  table,
  onOpen,
}: {
  table: WikiTableData;
  onOpen: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const items = table.rows.filter((row) => row[0]);

  return (
    <div className="wiki-table-stack-list">
      <div
        ref={trackRef}
        className="wiki-table-stack-track"
        onScroll={(event) => {
          const el = event.currentTarget;
          const card = el.querySelector<HTMLElement>(".wiki-table-card-list");
          if (!card) return;
          const gap = Number.parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 0;
          const step = card.getBoundingClientRect().width + gap;
          setPage(Math.round(el.scrollLeft / (step || 1)));
        }}
      >
        {items.map((row, index) => (
          <button
            key={index}
            type="button"
            className="wiki-table-card wiki-table-card-list"
            onClick={() => onOpen(index)}
          >
            <div
              className="wiki-table-card-body"
              dangerouslySetInnerHTML={{ __html: row[0].html }}
            />
          </button>
        ))}
      </div>
      {items.length > 1 ? (
        <div className="wiki-table-stack-meta">
          <span>{page + 1} / {items.length}</span>
          <div className="wiki-table-stack-dots">
            {items.map((_, index) => (
              <span key={index} data-active={index === page} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const SWIPE_AXIS = 8;
const SWIPE_COMMIT = 56;

function useSwipeNavigate(enabled: boolean, onPrev: () => void, onNext: () => void) {
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !surface) return;

    const drag = {
      pointerId: null as number | null,
      startX: 0,
      startY: 0,
      dx: 0,
      axis: null as "x" | "y" | null,
    };

    const pane = () => surface.querySelector<HTMLElement>(".wiki-table-modal-pane");

    const resetPane = (animate: boolean) => {
      const el = pane();
      if (!el) return;
      el.style.transition = animate ? "transform 0.2s ease, opacity 0.2s ease" : "";
      el.style.transform = "";
      el.style.opacity = "";
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if ((event.target as HTMLElement | null)?.closest("button, a")) return;
      drag.pointerId = event.pointerId;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.dx = 0;
      drag.axis = null;
    };

    const onMove = (event: PointerEvent) => {
      if (drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.axis) {
        if (Math.abs(dx) < SWIPE_AXIS && Math.abs(dy) < SWIPE_AXIS) return;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (drag.axis === "x") {
          try {
            surface.setPointerCapture(event.pointerId);
          } catch {
            // Synthetic or unsupported pointers still need the drag to continue.
          }
          pane()?.classList.add("is-dragging");
        }
      }
      if (drag.axis !== "x") return;
      event.preventDefault();
      drag.dx = dx;
      const el = pane();
      if (!el) return;
      el.style.transition = "none";
      el.style.transform = `translateX(${dx}px)`;
      el.style.opacity = String(Math.max(0.45, 1 - Math.abs(dx) / 360));
    };

    const onUp = (event: PointerEvent) => {
      if (drag.pointerId !== event.pointerId) return;
      const dx = drag.dx;
      const axis = drag.axis;
      drag.pointerId = null;
      drag.axis = null;
      pane()?.classList.remove("is-dragging");
      if (surface.hasPointerCapture(event.pointerId)) {
        try {
          surface.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore capture release errors from synthetic events.
        }
      }
      if (axis === "x" && Math.abs(dx) >= SWIPE_COMMIT) {
        if (dx < 0) onNext();
        else onPrev();
        return;
      }
      resetPane(axis === "x");
    };

    surface.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      surface.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [enabled, surface, onPrev, onNext]);

  return setSurface;
}

export function WikiTableGallery({ table }: { table: WikiTableData }) {
  const { layout, choose, showStack } = useGalleryLayout();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev" | "none">("none");
  const total = table.rows.length;
  const selected = selectedIndex === null ? null : table.rows[selectedIndex];
  const extraCells = selected?.slice(1) ?? [];
  const canNavigate = total > 1 && selectedIndex !== null;

  const goPrev = useCallback(() => {
    setDirection("prev");
    setSelectedIndex((current) => {
      if (current === null) return current;
      return ((current - 1) % total + total) % total;
    });
  }, [total]);

  const goNext = useCallback(() => {
    setDirection("next");
    setSelectedIndex((current) => {
      if (current === null) return current;
      return ((current + 1) % total + total) % total;
    });
  }, [total]);

  const swipeRef = useSwipeNavigate(canNavigate, goPrev, goNext);

  useEffect(() => {
    if (selectedIndex === null || total < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, total, goPrev, goNext]);

  return (
    <div className="wiki-table-gallery not-prose">
      <div className="wiki-table-toolbar">
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={layout}
          onValueChange={(value) => {
            if (value !== "grid" && value !== "stack") return;
            choose(value);
            setSelectedIndex(null);
          }}
          className="justify-end"
          aria-label="Modo de visualização"
        >
          <ToggleGroupItem value="grid" aria-label="Grade de cards">
            <LayoutGrid />
            Grade
          </ToggleGroupItem>
          <ToggleGroupItem value="stack" aria-label="Lista de cards">
            <ArrowLeftRight />
            Lista
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {showStack ? (
        <WikiCardList
          table={table}
          onOpen={(index) => {
            setDirection("none");
            setSelectedIndex(index);
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {table.rows.map((row, index) => {
            const preview = row[0];
            if (!preview) return null;
            return (
              <button
                key={index}
                type="button"
                className="wiki-table-card"
                onClick={() => {
                  setDirection("none");
                  setSelectedIndex(index);
                }}
              >
                <div
                  className="wiki-table-card-body"
                  dangerouslySetInnerHTML={{ __html: preview.html }}
                />
              </button>
            );
          })}
        </div>
      )}

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIndex(null);
            setDirection("none");
          }
        }}
      >
        <DialogContent
          className="flex flex-col max-w-lg max-h-[85vh] overflow-hidden border-primary/20 bg-card p-6"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div ref={swipeRef} className="wiki-table-swipe">
            {selected ? (
              <div
                key={selectedIndex}
                className="wiki-table-modal-pane"
                data-dir={direction}
              >
                <DialogHeader>
                  <DialogTitle className="font-serif text-primary pr-6">
                    {cellTitle(selected[0], table.headers[0] || "Detalhes")}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Informações adicionais deste item
                  </DialogDescription>
                </DialogHeader>
                <div className="wiki-table-modal space-y-4">
                  {selected[0]?.html ? (
                    <div
                      className="wiki-table-modal-preview"
                      dangerouslySetInnerHTML={{ __html: selected[0].html }}
                    />
                  ) : null}
                  {extraCells.map((cell, index) => {
                    const label = table.headers[index + 1];
                    if (!cell.html.trim() && !cell.text) return null;
                    return (
                      <section key={index} className="wiki-table-modal-field">
                        {label ? <h3>{label}</h3> : null}
                        <div dangerouslySetInnerHTML={{ __html: cell.html }} />
                      </section>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          {canNavigate ? (
            <nav className="wiki-table-modal-nav" aria-label="Navegar itens">
              <Button type="button" variant="outline" size="sm" onClick={goPrev}>
                <ChevronLeft />
                Anterior
              </Button>
              <span className="wiki-table-modal-count">
                {(selectedIndex ?? 0) + 1} / {total}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={goNext}>
                Próximo
                <ChevronRight />
              </Button>
            </nav>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ArticleBody({ html }: { html: string }) {
  const blocks = useMemo(() => parseArticleBlocks(html), [html]);

  return (
    <div className="tiptap-content">
      {blocks.map((block, index) =>
        block.type === "html" ? (
          <div key={index} dangerouslySetInnerHTML={{ __html: block.html }} />
        ) : (
          <WikiTableGallery key={index} table={block.table} />
        ),
      )}
    </div>
  );
}
