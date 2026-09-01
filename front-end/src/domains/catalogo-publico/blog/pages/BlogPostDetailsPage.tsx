import DOMPurify from "dompurify";
import { type ReactElement } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Container, Section, SectionHeader } from "@/design-system/ui";
import { usePublishedBlogPostBySlug } from "@/domains/catalogo-publico/blog/hooks/usePublishedBlogPostBySlug";
import { EmptyState } from "@/domains/catalogo-publico/shared/components/EmptyState";
import { PublicEntityDetailSkeleton } from "@/domains/catalogo-publico/shared/components/PublicEntityDetailSkeleton";
import { truncateMetaDescription } from "@/shell/public/seo/truncateMetaDescription";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";

interface IBlogPostRouteParams {
  slug?: string;
}

function formatPublicationDate(dataPublicacao: string | undefined): string {
  if (!dataPublicacao) return "";
  const date = new Date(dataPublicacao);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export function BlogPostDetailsPage(): ReactElement {
  const params = useParams<keyof IBlogPostRouteParams>();
  const slug: string | undefined = params.slug;

  const { post, isLoading, notFound, error } = usePublishedBlogPostBySlug(slug);

  const canonicalPostPath = slug ? `/blog/${slug}` : "/";

  usePublicPageMetadata({
    title: post
      ? `${post.titulo} | Blog | Celeiro do MS`
      : error
        ? "Erro ao carregar publicação | Celeiro do MS"
        : isLoading
          ? "Carregando publicação… | Celeiro do MS"
          : "Blog | Celeiro do MS",
    description: post ? truncateMetaDescription(post.resumo) : undefined,
    canonicalPath: canonicalPostPath,
  });

  if (isLoading) {
    return <PublicEntityDetailSkeleton loadingLabel="Carregando publicação" />;
  }

  if (error) {
    return (
      <Section spacing="xl">
        <EmptyState title="Erro ao carregar a publicação" description={error} />
        <div className="mt-6">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--color-secondary)] underline-offset-4 hover:underline"
          >
            Voltar para a home
          </Link>
        </div>
      </Section>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/" replace />;
  }

  const publicationDate = formatPublicationDate(post.dataPublicacao);
  const sanitizedContent = DOMPurify.sanitize(post.conteudo);

  return (
    <div className="bg-portal">
      <Section spacing="lg">
        <Link
          to="/"
          className="text-sm font-medium text-[var(--color-secondary)] underline-offset-4 hover:underline"
        >
          ← Voltar para publicações
        </Link>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-soft">
          {post.imagemDestaque ? (
            <img
              src={post.imagemDestaque}
              alt={post.titulo}
              className="h-[360px] w-full object-cover"
            />
          ) : (
            <div className="h-[360px] w-full bg-zinc-100" />
          )}
        </div>

        <div className="mt-8 max-w-3xl">
          <SectionHeader
            align="left"
            description={publicationDate || undefined}
          >
            {post.titulo}
          </SectionHeader>
        </div>
      </Section>

      <Section spacing="lg">
        <Container size="md">
          <div
            className="max-w-3xl space-y-4 text-base leading-7 text-zinc-700 [&_a]:text-[var(--color-secondary)] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_img]:rounded-xl [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </Container>
      </Section>
    </div>
  );
}
