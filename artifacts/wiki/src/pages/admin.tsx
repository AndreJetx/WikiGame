import { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useListArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, getListArticlesQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES } from "@/components/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RichEditor } from "@/components/rich-editor";
import { useQueryClient } from "@tanstack/react-query";
import { ImageUploadField } from "@/components/image-upload-field";
import { Edit, Trash, Plus, Search } from "lucide-react";

export function Admin() {
  return <GerenciamentoArtigos />;
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
    <Layout>
      <div className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary">Gerenciamento de Artigos</h1>
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
      </div>
    </Layout>
  );
}
