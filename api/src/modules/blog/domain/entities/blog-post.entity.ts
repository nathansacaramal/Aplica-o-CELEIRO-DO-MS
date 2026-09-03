// src/modules/blog/domain/entities/blog-post.entity.ts
import { BlogPostStatus } from "../value-objects/blog-post-status";

export interface BlogPostProps {
  id: number;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemDestaque: string;
  /** URLs das fotos extras (galeria), na ordem definida pelo admin. Sempre uma lista. */
  galeria: string[];
  status: BlogPostStatus;
  dataPublicacao: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BlogPostEntity {
  constructor(public readonly props: BlogPostProps) {}

  get id() {
    return this.props.id;
  }
  get titulo() {
    return this.props.titulo;
  }
  get slug() {
    return this.props.slug;
  }
  get resumo() {
    return this.props.resumo;
  }
  get conteudo() {
    return this.props.conteudo;
  }
  get imagemDestaque() {
    return this.props.imagemDestaque;
  }
  get galeria() {
    return this.props.galeria;
  }
  get status() {
    return this.props.status;
  }
  get dataPublicacao() {
    return this.props.dataPublicacao;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
