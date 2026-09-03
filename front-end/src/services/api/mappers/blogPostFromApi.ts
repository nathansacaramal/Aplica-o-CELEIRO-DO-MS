import type { IBlogPost } from "@/entities/blog-post/blogPost.types";
import { toIsoDate } from "./toIsoDate";

function toBlogPostStatus(value: unknown): IBlogPost["status"] {
  return value === "published" ? "published" : "draft";
}

export function mapBlogPostFromApi(raw: Record<string, unknown>): IBlogPost {
  return {
    id: Number(raw.id),
    titulo: String(raw.titulo ?? ""),
    slug: String(raw.slug ?? ""),
    resumo: String(raw.resumo ?? ""),
    conteudo: String(raw.conteudo ?? ""),
    imagemDestaque: raw.imagemDestaque !== undefined ? String(raw.imagemDestaque) : undefined,
    galeria: Array.isArray(raw.galeria)
      ? raw.galeria.filter((item): item is string => typeof item === "string" && item.trim() !== "")
      : [],
    status: toBlogPostStatus(raw.status),
    dataPublicacao:
      raw.dataPublicacao !== undefined ? toIsoDate(raw.dataPublicacao, "") : undefined,
    createdAt: toIsoDate(raw.createdAt, new Date(0).toISOString()),
    updatedAt: toIsoDate(raw.updatedAt, new Date(0).toISOString()),
  };
}
