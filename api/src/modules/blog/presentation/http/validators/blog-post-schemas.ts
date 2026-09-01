import { z } from "zod";
import { BLOG_POST_STATUSES } from "@/modules/blog/domain/value-objects/blog-post-status";
import { webImageFileSchema } from "@/modules/media/application/validators/web-image.schema";

export const createBlogPostSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  conteudo: z.string().min(1, "Conteúdo é obrigatório"),
  status: z.enum(BLOG_POST_STATUSES).default("draft"),
  dataPublicacao: z.coerce.date().optional(),
  image: webImageFileSchema,
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

/** Query string para GET listagens de publicações (admin e público). */
export const listBlogPostsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    titulo: z.string().trim().min(1).optional(),
    status: z.enum(BLOG_POST_STATUSES).optional(),
    sortBy: z.string().trim().optional(),
    sortDir: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type ListBlogPostsQueryDTO = z.infer<typeof listBlogPostsQuerySchema>;

/** Query string para GET /public/blog/latest. */
export const listLatestBlogPostsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(12).default(12),
  })
  .strict();

export type ListLatestBlogPostsQueryDTO = z.infer<typeof listLatestBlogPostsQuerySchema>;
