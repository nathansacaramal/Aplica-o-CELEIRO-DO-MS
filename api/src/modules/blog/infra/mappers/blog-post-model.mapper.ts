import { BlogPostEntity } from "../../domain/entities/blog-post.entity";
import { isBlogPostStatus } from "../../domain/value-objects/blog-post-status";
import BlogPostModel from "../model/blog-post-model";

/** Coluna JSON nullable: null, valor malformado ou item não-string viram lista vazia/filtrada. */
function toGaleria(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

export function blogPostModelToEntity(m: BlogPostModel): BlogPostEntity {
  const status = isBlogPostStatus(m.status) ? m.status : "draft";
  return new BlogPostEntity({
    id: m.id,
    titulo: m.titulo,
    slug: m.slug,
    resumo: m.resumo,
    conteudo: m.conteudo,
    imagemDestaque: m.imagemDestaque,
    galeria: toGaleria(m.galeria),
    status,
    dataPublicacao: m.dataPublicacao,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  });
}
