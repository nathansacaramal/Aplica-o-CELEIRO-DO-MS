export type BlogPostStatus = "draft" | "published";

interface IBlogPostBase {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemDestaque?: string;
  /** Fotos extras exibidas na galeria da publicação, na ordem definida pelo admin. */
  galeria: string[];
  status: BlogPostStatus;
  dataPublicacao?: string;
}

export interface IBlogPost extends IBlogPostBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Item da galeria no formulário: uma foto já publicada (`https://...`) ou uma
 * nova escolhida agora (data URL). O cliente HTTP converte as novas em base64.
 */
export type IGalleryItemInput = string;

/** `slug` e `resumo` são derivados no backend; `imagemDestacadaUrl` alimenta o AdminImageUrlField. */
export type ICreateBlogPostInput = Pick<IBlogPost, "titulo" | "conteudo" | "status"> & {
  dataPublicacao?: string;
  imagemDestacadaUrl: string;
  /** Lista final da galeria (mantidas + novas), na ordem de exibição. */
  galeria?: IGalleryItemInput[];
};

export type IUpdateBlogPostInput = Partial<ICreateBlogPostInput> & Pick<IBlogPost, "id">;
