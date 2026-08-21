import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Edit, Trash, Plus } from "lucide-react";

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      toast({ title: "Acesso concedido", description: "Bem-vindo aos arquivos, Administrador." });
    } else {
      toast({ title: "Acesso negado", description: "Senha incorreta.", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur border-primary/20 shadow-2xl shadow-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-serif text-primary">Acesso Restrito</CardTitle>
              <p className="text-muted-foreground mt-2">Apenas os anciãos reconhecidos da seita podem prosseguir.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input 
                  type="password" 
                  placeholder="Digite a senha..." 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-background/50 text-center text-lg tracking-widest"
                />
                <Button type="submit" className="w-full text-lg h-12">Entrar nos Arquivos</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: articles, isLoading } = useListArticles({ limit: 100 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  
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
          setIsDialogOpen(false);
          toast({ title: "Artigo atualizado" });
        }
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          setIsDialogOpen(false);
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
            <h1 className="text-3xl font-serif font-bold text-primary">Arquivos da Seita</h1>
            <p className="text-muted-foreground">Gerencie o conhecimento dos reinos.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2"><Plus className="w-4 h-4" /> Criar Novo Artigo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-primary/20">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL da Imagem</label>
                    <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  </div>
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
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingSlug ? "Salvar Alterações" : "Publicar Artigo"}
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
              ) : articles?.length ? (
                articles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell><span className="uppercase text-xs font-semibold text-muted-foreground tracking-wider">{article.category}</span></TableCell>
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
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Os arquivos estão vazios.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
