import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
  type ReactElement,
} from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type {
  BlogPostStatus,
  ICreateBlogPostInput,
  IUpdateBlogPostInput,
  IBlogPost,
} from "@/entities/blog-post/blogPost.types";
import { AdminGalleryField } from "@/domains/admin-cms/components/AdminGalleryField";
import { AdminImageUrlField } from "@/domains/admin-cms/components/AdminImageUrlField";
import { BlogRichTextEditor } from "@/domains/admin-cms/blog/components/BlogRichTextEditor";
import { useAdminBlogPostFormSource } from "@/domains/admin-cms/blog/hooks/useAdminBlogPostFormSource";
import { imageUrlForUpdate } from "@/domains/admin-cms/utils/imageUrlForUpdate";
import { toApiError } from "@/services/api/apiError";
import {
  createAdminBlogPost,
  updateAdminBlogPost,
} from "@/services/admin-api/adminBlogPosts.api";

interface IBlogPostFormRouteState {
  id?: number;
}

interface IBlogPostFormState {
  titulo: string;
  conteudo: string;
  status: BlogPostStatus;
  imagemDestacadaUrl: string;
  galeria: string[];
}

function buildInitialFormState(): IBlogPostFormState {
  return { titulo: "", conteudo: "", status: "draft", imagemDestacadaUrl: "", galeria: [] };
}

function mapPostToFormState(post: IBlogPost): IBlogPostFormState {
  return {
    titulo: post.titulo,
    conteudo: post.conteudo,
    status: post.status,
    imagemDestacadaUrl: post.imagemDestaque ?? "",
    galeria: post.galeria,
  };
}

export function AdminBlogPostFormPage(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  // O id chega pelo state da navegação (não pela URL), mesmo padrão de eventos/cidades.
  const routeState = location.state as IBlogPostFormRouteState | null;
  const rawPostId = Number(routeState?.id);
  const postId: number | undefined =
    Number.isFinite(rawPostId) && rawPostId > 0 ? rawPostId : undefined;

  const isEditRoute: boolean = location.pathname.endsWith("/editar");
  const isEditMode: boolean = Boolean(postId);

  const {
    post: loadedPost,
    isLoading,
    error: loadError,
    notFound,
  } = useAdminBlogPostFormSource(postId);

  const [formState, setFormState] = useState<IBlogPostFormState>(buildInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (!loadedPost || !postId) return;
    setFormState(mapPostToFormState(loadedPost));
  }, [loadedPost, postId]);

  const pageTitle: string = useMemo(
    () => (isEditMode ? "Editar publicação" : "Nova publicação"),
    [isEditMode],
  );

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    if (successMessage) setSuccessMessage("");
  }

  function handleContentChange(html: string): void {
    setFormState((current) => ({ ...current, conteudo: html }));
    if (successMessage) setSuccessMessage("");
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!formState.titulo.trim()) {
      setError("Informe o título da publicação.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      if (isEditMode && postId) {
        const input: IUpdateBlogPostInput = {
          id: postId,
          titulo: formState.titulo.trim(),
          conteudo: formState.conteudo,
          status: formState.status,
          imagemDestacadaUrl: imageUrlForUpdate(
            formState.imagemDestacadaUrl,
            loadedPost?.imagemDestaque ?? "",
          ),
          // Sempre a lista final: o backend troca a galeria inteira por esta.
          galeria: formState.galeria,
        };

        await updateAdminBlogPost(input);
        setSuccessMessage("Publicação atualizada com sucesso.");
      } else {
        const input: ICreateBlogPostInput = {
          titulo: formState.titulo.trim(),
          conteudo: formState.conteudo,
          status: formState.status,
          imagemDestacadaUrl: formState.imagemDestacadaUrl.trim(),
          galeria: formState.galeria,
        };

        await createAdminBlogPost(input);
        navigate("/admin/blog", { replace: true });
        return;
      }
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (notFound || (isEditRoute && !postId)) {
    return <Navigate to="/admin/blog" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader kicker="Admin CMS" tone="primary" description="Carregando publicação.">
          {pageTitle}
        </SectionHeader>
        <Card>
          <p className="text-sm text-zinc-600">Carregando dados...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Admin CMS"
        tone="primary"
        description="Escreva e publique conteúdos para o blog do portal."
      >
        {pageTitle}
      </SectionHeader>

      {error || loadError ? (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">{error || loadError}</p>
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="border border-emerald-200 bg-emerald-50">
          <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
        </Card>
      ) : null}

      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
        <Card className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="titulo" className="text-sm font-medium text-zinc-700">
              Título
            </label>
            <input
              id="titulo"
              name="titulo"
              value={formState.titulo}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <AdminImageUrlField
            id="imagemDestacadaUrl"
            label="Imagem de destaque"
            value={formState.imagemDestacadaUrl}
            disabled={isSubmitting}
            helperText={
              isEditMode
                ? "Opcional: deixe como está para manter a imagem atual, ou envie um novo arquivo para substituí-la."
                : undefined
            }
            onChange={(next) => {
              setFormState((s) => ({ ...s, imagemDestacadaUrl: next }));
              if (successMessage) setSuccessMessage("");
            }}
          />

          <AdminGalleryField
            id="galeria"
            value={formState.galeria}
            disabled={isSubmitting}
            onChange={(next) => {
              setFormState((s) => ({ ...s, galeria: next }));
              if (successMessage) setSuccessMessage("");
            }}
          />

          <div className="space-y-2">
            <span className="text-sm font-medium text-zinc-700">Conteúdo</span>
            <BlogRichTextEditor
              value={formState.conteudo}
              onChange={handleContentChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 md:w-64">
            <label htmlFor="status" className="text-sm font-medium text-zinc-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formState.status}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate("/admin/blog")}>
            Voltar
          </Button>

          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Salvar publicação
          </Button>
        </div>
      </form>
    </div>
  );
}
