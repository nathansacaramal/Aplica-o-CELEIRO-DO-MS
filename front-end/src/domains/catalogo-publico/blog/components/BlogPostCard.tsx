import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import type { IBlogPost } from "@/entities/blog-post/blogPost.types";

interface IBlogPostCardProps {
  post: IBlogPost;
}

function formatPublicationDate(post: IBlogPost): string {
  const raw = post.dataPublicacao ?? post.createdAt;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export function BlogPostCard({ post }: IBlogPostCardProps): ReactElement {
  const publicationDate = formatPublicationDate(post);

  return (
    <article className="card-soft shadow-soft overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      {post.imagemDestaque ? (
        <img
          src={post.imagemDestaque}
          alt={post.titulo}
          className="h-56 w-full object-cover"
        />
      ) : (
        <div className="h-56 w-full bg-zinc-100" />
      )}

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-zinc-900">
          {post.titulo}
        </h3>

        {publicationDate ? (
          <p className="text-sm text-zinc-500">{publicationDate}</p>
        ) : null}

        <p className="line-clamp-3 text-sm leading-6 text-zinc-600">{post.resumo}</p>

        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Leia mais
        </Link>
      </div>
    </article>
  );
}
