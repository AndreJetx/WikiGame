import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus,
  AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  ImageIcon, Video, Link2, Table2,
  Undo, Redo, Trash2, Loader2,
  BetweenHorizontalStart, BetweenHorizontalEnd,
  BetweenVerticalStart, BetweenVerticalEnd,
  Rows3, Columns3, Baseline,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TABLE_GRID_MAX = 8;

const FONT_COLORS = [
  { name: "Ouro", value: "#e8c547" },
  { name: "Âmbar", value: "#f59e0b" },
  { name: "Vermelho", value: "#dc2626" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Verde", value: "#22c55e" },
  { name: "Lima", value: "#84cc16" },
  { name: "Branco", value: "#f8fafc" },
  { name: "Cinza", value: "#9ca3af" },
  { name: "Preto", value: "#111827" },
];

const cellExtraAttributes = {
  verticalAlign: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.verticalAlign || null,
    renderHTML: (attributes: { verticalAlign?: string | null }) => {
      if (!attributes.verticalAlign) return {};
      return { style: `vertical-align: ${attributes.verticalAlign}` };
    },
  },
};

const ResizableTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const raw = element.style.height || element.getAttribute("height");
          if (!raw) return null;
          const value = parseInt(raw, 10);
          return Number.isFinite(value) ? value : null;
        },
        renderHTML: (attributes: { height?: number | null }) => {
          if (!attributes.height) return {};
          return { style: `height: ${attributes.height}px` };
        },
      },
    };
  },
});

const AlignedTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellExtraAttributes,
    };
  },
});

const AlignedTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellExtraAttributes,
    };
  },
});

function ToolbarButton({ onClick, active, children, title, disabled }: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:pointer-events-none",
        active ? "bg-primary/30 text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 self-center" />;
}

function TableSizePicker({
  onInsert,
}: {
  onInsert: (rows: number, cols: number, withHeaderRow: boolean) => void;
}) {
  const [hover, setHover] = useState({ rows: 3, cols: 3 });
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [customRows, setCustomRows] = useState("3");
  const [customCols, setCustomCols] = useState("3");

  const insertCustom = () => {
    const rows = Math.min(20, Math.max(1, parseInt(customRows, 10) || 1));
    const cols = Math.min(20, Math.max(1, parseInt(customCols, 10) || 1));
    onInsert(rows, cols, withHeaderRow);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Inserir tabela</p>
      <div
        className="grid gap-0.5 w-fit mx-auto"
        style={{ gridTemplateColumns: `repeat(${TABLE_GRID_MAX}, 1.15rem)` }}
        onMouseLeave={() => setHover({ rows: 3, cols: 3 })}
      >
        {Array.from({ length: TABLE_GRID_MAX * TABLE_GRID_MAX }, (_, index) => {
          const row = Math.floor(index / TABLE_GRID_MAX) + 1;
          const col = (index % TABLE_GRID_MAX) + 1;
          const active = row <= hover.rows && col <= hover.cols;
          return (
            <button
              key={index}
              type="button"
              aria-label={`${row} por ${col}`}
              className={cn(
                "w-4 h-4 border rounded-[2px] transition-colors",
                active ? "bg-primary border-primary" : "bg-background border-border hover:border-primary/60"
              )}
              onMouseEnter={() => setHover({ rows: row, cols: col })}
              onClick={() => onInsert(row, col, withHeaderRow)}
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center tabular-nums">
        {hover.rows} × {hover.cols} {hover.rows === 1 ? "linha" : "linhas"}
      </p>
      <div className="flex items-center gap-2">
        <Checkbox
          id="table-header-row"
          checked={withHeaderRow}
          onCheckedChange={(checked) => setWithHeaderRow(!!checked)}
        />
        <label htmlFor="table-header-row" className="text-xs cursor-pointer">
          Linha de cabeçalho
        </label>
      </div>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-popover px-2 text-muted-foreground">ou tamanho exato</span></div>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] text-muted-foreground">Linhas</label>
          <Input
            type="number"
            min={1}
            max={20}
            value={customRows}
            onChange={(e) => setCustomRows(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[11px] text-muted-foreground">Colunas</label>
          <Input
            type="number"
            min={1}
            max={20}
            value={customCols}
            onChange={(e) => setCustomCols(e.target.value)}
            className="h-8"
          />
        </div>
        <Button type="button" size="sm" className="h-8" onClick={insertCustom}>
          Inserir
        </Button>
      </div>
    </div>
  );
}

function findTableCell(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("td, th");
}

function updateRowHeightFromCell(view: { posAtDOM: (node: Node, offset: number) => number; state: any; dispatch: (tr: any) => void }, cell: HTMLElement, height: number) {
  const pos = view.posAtDOM(cell, 0);
  const $pos = view.state.doc.resolve(pos);
  for (let depth = $pos.depth; depth > 0; depth--) {
    if ($pos.node(depth).type.name === "tableRow") {
      const from = $pos.before(depth);
      const node = $pos.node(depth);
      view.dispatch(view.state.tr.setNodeMarkup(from, undefined, { ...node.attrs, height }));
      return;
    }
  }
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProgrammaticUpdate = useRef(false);
  const rowResizeRef = useRef<{
    startY: number;
    startHeight: number;
    cell: HTMLElement;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ allowBase64: true, HTMLAttributes: { class: "rounded-lg max-w-full my-4" } }),
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        handleWidth: 8,
        cellMinWidth: 48,
        HTMLAttributes: { class: "wiki-table" },
      }),
      ResizableTableRow,
      AlignedTableHeader,
      AlignedTableCell,
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: "w-full aspect-video rounded-lg my-4" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph", "tableCell", "tableHeader"] }),
      Placeholder.configure({ placeholder: placeholder || "Escreva o conteúdo do artigo..." }),
    ],
    content: value,
    onUpdate({ editor }) {
      if (!isProgrammaticUpdate.current) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone dark:prose-invert prose-headings:font-serif prose-h1:text-primary max-w-none min-h-[300px] p-4 focus:outline-none"
      },
      handleDOMEvents: {
        mousemove(view, event) {
          const mouseEvent = event as MouseEvent;
          const cell = findTableCell(mouseEvent.target);
          view.dom.querySelectorAll(".row-resize-hover").forEach((el) => el.classList.remove("row-resize-hover"));
          if (!cell || rowResizeRef.current) return false;
          const rect = cell.getBoundingClientRect();
          const nearBottom = mouseEvent.clientY >= rect.bottom - 6 && mouseEvent.clientY <= rect.bottom + 4;
          const nearRight = mouseEvent.clientX >= rect.right - 8;
          if (nearBottom && !nearRight) {
            cell.classList.add("row-resize-hover");
            view.dom.classList.add("row-resize-cursor");
          } else {
            view.dom.classList.remove("row-resize-cursor");
          }
          return false;
        },
        mousedown(view, event) {
          const mouseEvent = event as MouseEvent;
          if (!view.dom.classList.contains("row-resize-cursor")) return false;
          const cell = findTableCell(mouseEvent.target);
          if (!cell) return false;
          mouseEvent.preventDefault();
          const startHeight = cell.parentElement?.getBoundingClientRect().height ?? cell.getBoundingClientRect().height;
          rowResizeRef.current = { startY: mouseEvent.clientY, startHeight, cell };
          const onMove = (moveEvent: MouseEvent) => {
            const current = rowResizeRef.current;
            if (!current) return;
            const height = Math.max(28, current.startHeight + (moveEvent.clientY - current.startY));
            const row = current.cell.parentElement;
            if (row) row.style.height = `${height}px`;
          };
          const onUp = (upEvent: MouseEvent) => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            const current = rowResizeRef.current;
            rowResizeRef.current = null;
            view.dom.classList.remove("row-resize-cursor");
            if (!current) return;
            const height = Math.max(28, current.startHeight + (upEvent.clientY - current.startY));
            updateRowHeightFromCell(view, current.cell, height);
          };
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          return true;
        },
      },
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      isProgrammaticUpdate.current = true;
      editor.commands.setContent(value);
      isProgrammaticUpdate.current = false;
    }
  }, [value]);

  if (!editor) return null;

  const insertImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl("");
    }
  };

  const uploadAndInsertImage = async (file: File | undefined) => {
    if (!file || !editor) return;
    setUploadError(null);
    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(file, "wiki-articles/content");
      editor.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertVideo = () => {
    if (videoUrl.trim()) {
      editor.commands.setYoutubeVideo({ src: videoUrl.trim() });
      setVideoUrl("");
    }
  };

  const setLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkUrl("");
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const insertTable = (rows: number, cols: number, withHeaderRow: boolean) => {
    setTableMenuOpen(false);
    requestAnimationFrame(() => {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    });
  };

  const setCellVerticalAlign = (verticalAlign: string) => {
    editor.chain().focus()
      .updateAttributes("tableCell", { verticalAlign })
      .updateAttributes("tableHeader", { verticalAlign })
      .run();
  };

  const inTable = editor.isActive("table");
  const cellVerticalAlign = (editor.getAttributes("tableCell").verticalAlign
    || editor.getAttributes("tableHeader").verticalAlign
    || "top") as string;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background/50">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30 sticky top-0 z-10">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo className="w-4 h-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrito"><Bold className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Itálico"><Italic className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Sublinhado"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Tachado"><Strikethrough className="w-4 h-4" /></ToolbarButton>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Cor do texto"
              className="p-1.5 rounded hover:bg-primary/20 transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="flex flex-col items-center gap-0.5">
                <Baseline className="w-4 h-4" />
                <span
                  className="block h-0.5 w-3.5 rounded-sm"
                  style={{ backgroundColor: editor.getAttributes("textStyle").color || "currentColor" }}
                />
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 space-y-3" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            <p className="text-sm font-medium">Cor do texto</p>
            <div className="grid grid-cols-6 gap-1.5">
              {FONT_COLORS.map((swatch) => {
                const active = editor.getAttributes("textStyle").color === swatch.value;
                return (
                  <button
                    key={swatch.value}
                    type="button"
                    title={swatch.name}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().setColor(swatch.value).run()}
                    className={cn(
                      "h-6 w-6 rounded-full border border-border shadow-sm",
                      active && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    )}
                    style={{ backgroundColor: swatch.value }}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Cor personalizada"
                className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                value={editor.getAttributes("textStyle").color || "#e8c547"}
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex-1"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Remover cor
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Título 1"><Heading1 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Título 2"><Heading2 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Título 3"><Heading3 className="w-4 h-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista com marcadores"><List className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada"><ListOrdered className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citação"><Quote className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Bloco de código"><Code className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divisor"><Minus className="w-4 h-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Alinhar à esquerda"><AlignLeft className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centralizar"><AlignCenter className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Alinhar à direita"><AlignRight className="w-4 h-4" /></ToolbarButton>
        <Divider />
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Inserir imagem" className="p-1.5 rounded hover:bg-primary/20 transition-colors text-muted-foreground hover:text-foreground">
              <ImageIcon className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 space-y-2">
            <p className="text-sm font-medium">Inserir imagem ou GIF</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,image/gif"
              className="hidden"
              onChange={(e) => uploadAndInsertImage(e.target.files?.[0])}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              disabled={uploadingImage || !isCloudinaryConfigured()}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Upload Cloudinary"
              )}
            </Button>
            {!isCloudinaryConfigured() && (
              <p className="text-xs text-muted-foreground">Configure VITE_CLOUDINARY_* no .env</p>
            )}
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-popover px-2 text-muted-foreground">ou URL</span></div>
            </div>
            <Input placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && insertImage()} />
            <Button size="sm" onClick={insertImage} className="w-full">Inserir URL</Button>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Insert video" className="p-1.5 rounded hover:bg-primary/20 transition-colors text-muted-foreground hover:text-foreground">
              <Video className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 space-y-2">
            <p className="text-sm font-medium">Inserir vídeo (YouTube)</p>
            <Input placeholder="https://youtube.com/..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && insertVideo()} />
            <Button size="sm" onClick={insertVideo} className="w-full">Inserir</Button>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Insert link" className={cn("p-1.5 rounded hover:bg-primary/20 transition-colors", editor.isActive("link") ? "bg-primary/30 text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Link2 className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 space-y-2">
            <p className="text-sm font-medium">Inserir link</p>
            <Input placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && setLink()} />
            <div className="flex gap-2">
              <Button size="sm" onClick={setLink} className="flex-1">Aplicar</Button>
              <Button size="sm" variant="outline" onClick={() => editor.chain().focus().unsetLink().run()}>Remover</Button>
            </div>
          </PopoverContent>
        </Popover>
        <Popover open={tableMenuOpen} onOpenChange={setTableMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Inserir tabela"
              className={cn(
                "p-1.5 rounded hover:bg-primary/20 transition-colors",
                inTable || tableMenuOpen ? "bg-primary/30 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Table2 className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <TableSizePicker onInsert={insertTable} />
          </PopoverContent>
        </Popover>
        {inTable && (
          <>
            <Divider />
            <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Inserir linha acima">
              <BetweenHorizontalStart className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Inserir linha abaixo">
              <BetweenHorizontalEnd className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Excluir linha">
              <Rows3 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Inserir coluna à esquerda">
              <BetweenVerticalStart className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Inserir coluna à direita">
              <BetweenVerticalEnd className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Excluir coluna">
              <Columns3 className="w-4 h-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton onClick={() => setCellVerticalAlign("top")} active={cellVerticalAlign === "top"} title="Alinhar ao topo">
              <AlignVerticalJustifyStart className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => setCellVerticalAlign("middle")} active={cellVerticalAlign === "middle"} title="Centralizar verticalmente">
              <AlignVerticalJustifyCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => setCellVerticalAlign("bottom")} active={cellVerticalAlign === "bottom"} title="Alinhar à base">
              <AlignVerticalJustifyEnd className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Excluir tabela">
              <Trash2 className="w-4 h-4 text-destructive" />
            </ToolbarButton>
          </>
        )}
      </div>
      <EditorContent editor={editor} />
      {inTable && (
        <p className="px-3 py-1.5 text-[11px] text-muted-foreground border-t border-border bg-muted/20">
          Arraste a borda direita da célula para a largura da coluna, e a borda inferior para a altura da linha.
        </p>
      )}
    </div>
  );
}
