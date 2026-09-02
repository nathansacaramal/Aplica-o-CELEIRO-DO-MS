import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button, Section, SectionHeader } from "@/design-system/ui";
import { useLatestBlogPosts } from "@/domains/catalogo-publico/blog/hooks/useLatestBlogPosts";
import { BlogPostCard } from "./BlogPostCard";

/**
 * Seção "Últimas publicações" da home. Nunca quebra a página: enquanto carrega não mostra nada
 * de errado, e se não houver publicações publicadas a seção simplesmente não é renderizada.
 */
export function LatestBlogPostsSection(): ReactElement | null {
  const { posts, isLoading } = useLatestBlogPosts();

  if (!isLoading && posts.length === 0) {
    return null;
  }

  return (
    <Section spacing="xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          kicker="Blog"
          tone="primary"
          description="Novidades, eventos e histórias do Celeiro do MS."
        >
          Últimas publicações
        </SectionHeader>

        {!isLoading ? (
          <Link to="/blog" className="shrink-0">
            <Button variant="ghost" size="sm">
              Ver todas as publicações
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? [0, 1, 2].map((key) => (
              <div key={key} className="h-[360px] animate-pulse rounded-2xl bg-zinc-100" />
            ))
          : posts.map((post) => <BlogPostCard key={post.id} post={post} />)}
      </div>
    </Section>
  );
}
