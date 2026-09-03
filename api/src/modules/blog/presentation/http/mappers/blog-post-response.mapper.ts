import { BlogPostEntity, type BlogPostProps } from "@/modules/blog/domain/entities/blog-post.entity";

function blogPostPropsOf(source: BlogPostEntity | BlogPostProps): BlogPostProps {
  return source instanceof BlogPostEntity ? source.props : source;
}

/** Corpo JSON alinhado ao contrato de publicações do blog (admin e público). */
export function toBlogPostHttpPayload(source: BlogPostEntity | BlogPostProps) {
  const p = blogPostPropsOf(source);
  return {
    id: p.id,
    titulo: p.titulo,
    slug: p.slug,
    resumo: p.resumo,
    conteudo: p.conteudo,
    imagemDestaque: p.imagemDestaque,
    galeria: p.galeria,
    status: p.status,
    dataPublicacao: p.dataPublicacao,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
