import { BlogPostEntity } from "../../domain/entities/blog-post.entity";
import { isBlogPostStatus } from "../../domain/value-objects/blog-post-status";
import BlogPostModel from "../model/blog-post-model";

export function blogPostModelToEntity(m: BlogPostModel): BlogPostEntity {
  const status = isBlogPostStatus(m.status) ? m.status : "draft";
  return new BlogPostEntity({
    id: m.id,
    titulo: m.titulo,
    slug: m.slug,
    resumo: m.resumo,
    conteudo: m.conteudo,
    imagemDestaque: m.imagemDestaque,
    status,
    dataPublicacao: m.dataPublicacao,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  });
}
