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
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus,
  AlignLeft, AlignCenter, AlignRight,
  ImageIcon, Video, Link2, Table2,
  Undo, Redo, Trash2
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({ onClick, active, children, title }: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-primary/20 transition-colors",
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

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const isProgrammaticUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ allowBase64: true, HTMLAttributes: { class: "rounded-lg max-w-full my-4" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full" } }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: "w-full aspect-video rounded-lg my-4" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
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
      }
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

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

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
            <Input placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && insertImage()} />
            <Button size="sm" onClick={insertImage} className="w-full">Inserir</Button>
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
        <ToolbarButton onClick={insertTable} title="Insert table"><Table2 className="w-4 h-4" /></ToolbarButton>
        {editor.isActive("table") && (
          <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">
            <Trash2 className="w-4 h-4 text-destructive" />
          </ToolbarButton>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
