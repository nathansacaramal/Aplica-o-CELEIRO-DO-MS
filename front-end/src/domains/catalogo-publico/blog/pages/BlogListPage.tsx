import type { ReactElement } from "react";
import { Section, SectionHeader } from "@/design-system/ui";
import { BlogPostCard } from "@/domains/catalogo-publico/blog/components/BlogPostCard";
import { useBlogPostsListPaginado } from "@/domains/catalogo-publico/blog/hooks/useBlogPostsListPaginado";
import { CatalogListingShell } from "@/domains/catalogo-publico/shared/components/CatalogListingShell";
import { EmptyState } from "@/domains/catalogo-publico/shared/components/EmptyState";
import { LoadMoreButton } from "@/domains/catalogo-publico/shared/components/LoadMoreButton";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";

export function BlogListPage(): ReactElement {
  usePublicPageMetadata({
    title: "Blog | Celeiro do MS",
    description:
      "Todas as publicações do blog do Celeiro do MS — eventos, turismo e novidades do Mato Grosso do Sul.",
    canonicalPath: "/blog",
  });

  const { data, isInitialLoading, isLoadingMore, error, loadMore } =
    useBlogPostsListPaginado();

  const isEmpty: boolean = !isInitialLoading && !error && data.items.length === 0;

  return (
    <Section spacing="xl">
      <SectionHeader
        kicker="Blog"
        tone="primary"
        description="Novidades, eventos e histórias do Celeiro do MS."
      >
        Todas as publicações
      </SectionHeader>

      <CatalogListingShell showSkeleton={isInitialLoading} skeletonCount={6}>
        <>
          {error ? (
            <EmptyState title="Erro ao carregar publicações" description={error} />
          ) : null}

          {isEmpty ? (
            <EmptyState
              title="Nenhuma publicação encontrada"
              description="Ainda não há publicações disponíveis no blog."
            />
          ) : null}

          {!isInitialLoading && !error && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data.items.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
              {data.hasMore ? (
                <LoadMoreButton isLoading={isLoadingMore} onClick={loadMore} />
              ) : null}
            </>
          ) : null}
        </>
      </CatalogListingShell>
    </Section>
  );
}
