import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type { BlogPostStatus, IBlogPost } from "@/entities/blog-post/blogPost.types";
import { AdminCrmListTableSkeleton } from "@/domains/admin-cms/components/AdminCrmListTableSkeleton";
import { BlogPublishToggle } from "@/domains/admin-cms/blog/components/BlogPublishToggle";
import { useAdminBlogPostsList } from "@/domains/admin-cms/blog/hooks/useAdminBlogPostsList";
import { toApiError } from "@/services/api/apiError";
import {
  deleteAdminBlogPost,
  updateAdminBlogPost,
} from "@/services/admin-api/adminBlogPosts.api";

function formatDate(post: IBlogPost): string {
  const raw = post.dataPublicacao ?? post.createdAt;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
}

export function AdminBlogPostsListPage(): ReactElement {
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "">("");
  const [tituloFilter, setTituloFilter] = useState<string>("");

  const {
    items,
    setItems,
    isLoading,
    error: loadError,
  } = useAdminBlogPostsList(statusFilter || undefined, tituloFilter || undefined);
  const [error, setError] = useState<string>("");

  async function handleDelete(id: number): Promise<void> {
    try {
      setError("");
      await deleteAdminBlogPost(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  }

  async function handleToggleStatus(post: IBlogPost, nextStatus: BlogPostStatus): Promise<void> {
    try {
      setError("");
      const updated = await updateAdminBlogPost({ id: post.id, status: nextStatus });
      setItems((current) => current.map((item) => (item.id === post.id ? updated : item)));
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader
          kicker="Admin CMS"
          tone="primary"
          description="Gerencie as publicações do blog exibidas no portal público."
        >
          Publicações
        </SectionHeader>

        <Link to="/admin/blog/novo">
          <Button variant="primary">Nova publicação</Button>
        </Link>
      </div>

      {error || loadError ? (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">{error || loadError}</p>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="titulo-filter" className="text-sm font-medium text-zinc-700">
            Buscar por título
          </label>
          <input
            id="titulo-filter"
            value={tituloFilter}
            onChange={(e) => setTituloFilter(e.target.value)}
            placeholder="Digite parte do título..."
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="space-y-2 sm:w-56">
          <label htmlFor="status-filter" className="text-sm font-medium text-zinc-700">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BlogPostStatus | "")}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
          >
            <option value="">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </Card>

      <Card>
        {isLoading ? <AdminCrmListTableSkeleton /> : null}

        {!isLoading && items.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhuma publicação encontrada.</p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3">Imagem</th>
                  <th className="py-3">Título</th>
                  <th className="py-3">Data</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-3">
                      {item.imagemDestaque ? (
                        <img
                          src={item.imagemDestaque}
                          alt={item.titulo}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-zinc-100" />
                      )}
                    </td>
                    <td className="py-4">{item.titulo}</td>
                    <td className="py-4">{formatDate(item)}</td>
                    <td className="py-4">
                      <span
                        className={
                          item.status === "published"
                            ? "font-medium text-emerald-600"
                            : "font-medium text-zinc-500"
                        }
                      >
                        {item.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <BlogPublishToggle
                          status={item.status}
                          onToggle={(next) => void handleToggleStatus(item, next)}
                        />

                        {item.status === "published" ? (
                          <a href={`/blog/${item.slug}`} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm">
                              Visualizar
                            </Button>
                          </a>
                        ) : null}

                        <Link to="/admin/blog/editar" state={{ id: item.id }}>
                          <Button variant="secondary" size="sm">
                            Editar
                          </Button>
                        </Link>

                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => void handleDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
