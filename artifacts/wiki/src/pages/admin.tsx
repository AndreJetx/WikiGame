import { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useListArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, getListArticlesQueryKey, useListTools, useCreateTool, useUpdateTool, useDeleteTool, getListToolsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES } from "@/components/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RichEditor } from "@/components/rich-editor";
import { useQueryClient } from "@tanstack/react-query";
import { ImageUploadField } from "@/components/image-upload-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash, Plus, Search, ExternalLink } from "lucide-react";

export function Admin() {
  return (
    <Layout>
      <div className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary">Painel de Gerenciamento</h1>
          <p className="text-muted-foreground">Gerencie artigos e sites adjacentes da wiki.</p>
        </div>
        <Tabs defaultValue="articles">
          <TabsList className="mb-6">
            <TabsTrigger value="articles">Artigos</TabsTrigger>
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
          </TabsList>
          <TabsContent value="articles">
            <GerenciamentoArtigos />
          </TabsContent>
          <TabsContent value="tools">
            <GerenciamentoFerramentas />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function GerenciamentoArtigos() {
  const queryClient = useQueryClient();
  const { data: articles, isLoading } = useListArticles({ limit: 100 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredArticles = (articles ?? []).filter((article) => {
    if (!normalizedQuery) return true;
    const haystack = [
      article.title,
      article.slug,
      article.category,
      article.excerpt,
      ...(article.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
  
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "", slug: "", category: "cultivation", excerpt: "", content: "", tags: "", imageUrl: "", featured: false
  });

  const resetForm = () => {
    setFormData({ title: "", slug: "", category: "cultivation", excerpt: "", content: "", tags: "", imageUrl: "", featured: false });
    setEditingSlug(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const requestCloseDialog = () => {
    const ok = window.confirm(
      "Descartar as alterações? O conteúdo não salvo será perdido.",
    );
    if (ok) closeDialog();
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setIsDialogOpen(true);
      return;
    }
    requestCloseDialog();
  };

  const openEdit = (article: any) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      tags: article.tags?.join(", ") || "",
      imageUrl: article.imageUrl || "",
      featured: article.featured || false
    });
    setEditingSlug(article.slug);
    setIsDialogOpen(true);
  };

  const handleDelete = (slug: string) => {
    if (confirm("Tem certeza que deseja excluir este artigo permanentemente?")) {
      deleteMutation.mutate({ slug }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          toast({ title: "Artigo excluído" });
        }
      });
    }
  };

  const handleMoveCategory = (slug: string, category: string) => {
    updateMutation.mutate(
      { slug, data: { category } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          const name = CATEGORIES.find((c) => c.slug === category)?.name ?? category;
          toast({ title: `Artigo movido para ${name}` });
        },
        onError: () => {
          toast({ title: "Não foi possível mover o artigo", variant: "destructive" });
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      excerpt: formData.excerpt,
      content: formData.content,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      imageUrl: formData.imageUrl || null,
      featured: formData.featured
    };

    if (editingSlug) {
      updateMutation.mutate({ slug: editingSlug, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          closeDialog();
          toast({ title: "Artigo atualizado" });
        }
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          closeDialog();
          toast({ title: "Artigo criado" });
        }
      });
    }
  };

  return (
    <>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-serif font-bold">Artigos</h2>
            <p className="text-muted-foreground">Gerencie o conhecimento dos reinos.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2"><Plus className="w-4 h-4" /> Criar Novo Artigo</Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-primary/20"
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-primary">{editingSlug ? "Editar Artigo" : "Criar Novo Artigo"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required disabled={!!editingSlug} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <ImageUploadField
                    value={formData.imageUrl}
                    onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resumo</label>
                  <Textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conteúdo</label>
                  <RichEditor
                    value={formData.content}
                    onChange={(html) => setFormData({...formData, content: html})}
                    placeholder="Escreva o conteúdo do artigo..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                    <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox id="featured" checked={formData.featured} onCheckedChange={(c) => setFormData({...formData, featured: !!c})} />
                    <label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Destacado na Biblioteca
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={requestCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingSlug ? "Salvar Alterações" : "Publicar Artigo"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, slug, categoria ou tag..."
            className="pl-10 h-11 bg-card/50 border-primary/20 focus-visible:ring-primary"
          />
        </div>

        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Consultando os arquivos...</TableCell></TableRow>
              ) : filteredArticles.length ? (
                filteredArticles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell className="min-w-[220px]">
                      <Select
                        value={article.category}
                        onValueChange={(category) => {
                          if (category === article.category) return;
                          handleMoveCategory(article.slug, category);
                        }}
                        disabled={updateMutation.isPending && updateMutation.variables?.slug === article.slug}
                      >
                        <SelectTrigger className="h-8 w-full max-w-[240px] text-sm">
                          <SelectValue placeholder={article.category} />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.slug} value={c.slug}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{article.viewCount}</TableCell>
                    <TableCell>{new Date(article.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(article)}><Edit className="w-4 h-4 text-primary" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(article.slug)}><Trash className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {normalizedQuery ? "Nenhum artigo encontrado para essa pesquisa." : "Os arquivos estão vazios."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
    </>
  );
}

function normalizeToolHref(href: string) {
  const trimmed = href.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  return `https://${trimmed}`;
}

function GerenciamentoFerramentas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: tools, isLoading } = useListTools();
  const createMutation = useCreateTool();
  const updateMutation = useUpdateTool();
  const deleteMutation = useDeleteTool();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    href: "",
    description: "",
    external: true,
  });

  const resetForm = () => {
    setFormData({ name: "", href: "", description: "", external: true });
    setEditingId(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const openEdit = (tool: { id: number; name: string; href: string; description?: string; external: boolean }) => {
    setFormData({
      name: tool.name,
      href: tool.href,
      description: tool.description || "",
      external: tool.external,
    });
    setEditingId(tool.id);
    setIsDialogOpen(true);
  };

  const invalidateTools = () => {
    queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const href = normalizeToolHref(formData.href);
    const payload = {
      name: formData.name.trim(),
      href,
      description: formData.description.trim(),
      external: formData.external,
    };

    if (editingId !== null) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            invalidateTools();
            closeDialog();
            toast({ title: "Link atualizado" });
          },
          onError: () => {
            toast({ title: "Não foi possível salvar o link", variant: "destructive" });
          },
        },
      );
      return;
    }

    createMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          invalidateTools();
          closeDialog();
          toast({ title: "Link adicionado" });
        },
        onError: () => {
          toast({ title: "Não foi possível adicionar o link", variant: "destructive" });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Excluir este link das ferramentas?")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          invalidateTools();
          toast({ title: "Link excluído" });
        },
        onError: () => {
          toast({ title: "Não foi possível excluir o link", variant: "destructive" });
        },
      },
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-serif font-bold">Ferramentas</h2>
          <p className="text-muted-foreground">Sites adjacentes que aparecem no menu lateral.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (open) setIsDialogOpen(true); else closeDialog(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-primary">
                {editingId !== null ? "Editar link" : "Novo link"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Legend of Elements"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  placeholder="https://exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="O que esse site faz"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tool-external"
                  checked={formData.external}
                  onCheckedChange={(checked) => setFormData({ ...formData, external: !!checked })}
                />
                <label htmlFor="tool-external" className="text-sm font-medium leading-none">
                  Abrir em nova aba
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId !== null ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Carregando links...
                </TableCell>
              </TableRow>
            ) : tools?.length ? (
              tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell className="max-w-[360px]">
                    <a
                      href={tool.href}
                      target={tool.external ? "_blank" : undefined}
                      rel={tool.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline truncate"
                    >
                      <span className="truncate">{tool.href}</span>
                      {tool.external ? <ExternalLink className="w-3.5 h-3.5 shrink-0" /> : null}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(tool)}>
                        <Edit className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tool.id)}>
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum link ainda. Adicione um site adjacente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
