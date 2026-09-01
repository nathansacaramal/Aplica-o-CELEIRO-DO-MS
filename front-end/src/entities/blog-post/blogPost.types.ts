export type BlogPostStatus = "draft" | "published";

interface IBlogPostBase {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemDestaque?: string;
  status: BlogPostStatus;
  dataPublicacao?: string;
}

export interface IBlogPost extends IBlogPostBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

/** `slug` e `resumo` são derivados no backend; `imagemDestacadaUrl` alimenta o AdminImageUrlField. */
export type ICreateBlogPostInput = Pick<IBlogPost, "titulo" | "conteudo" | "status"> & {
  dataPublicacao?: string;
  imagemDestacadaUrl: string;
};

export type IUpdateBlogPostInput = Partial<ICreateBlogPostInput> & Pick<IBlogPost, "id">;
