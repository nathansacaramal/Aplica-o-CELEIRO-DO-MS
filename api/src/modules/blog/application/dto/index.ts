import { z } from "zod";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
} from "../../presentation/http/validators/blog-post-schemas";
import { BlogPostStatus } from "../../domain/value-objects/blog-post-status";

export type CreateBlogPostDTO = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostDTO = z.infer<typeof updateBlogPostSchema>;

export type ListBlogPostsDTO = {
  page?: number | string;
  limit?: number | string;

  titulo?: string;
  status?: BlogPostStatus;
  /** Força a listagem a considerar apenas publicados, independente de `status` (uso público). */
  onlyPublished?: boolean;

  sortBy?: string;
  sortDir?: "asc" | "desc" | string;
};

export type ListBlogPostsResult = {
  items: Array<{
    id: number;
    titulo: string;
    slug: string;
    resumo: string;
    conteudo: string;
    imagemDestaque: string;
    galeria: string[];
    status: BlogPostStatus;
    dataPublicacao: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort?: { by: string; dir: "asc" | "desc" };
};
