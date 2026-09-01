import type { ListBlogPostsDTO } from "@/modules/blog/application/dto";
import type { ListBlogPostsQueryDTO } from "../validators/blog-post-schemas";

export function toListBlogPostsUseCaseInput(
  query: ListBlogPostsQueryDTO,
  options: { onlyPublished?: boolean } = {},
): ListBlogPostsDTO {
  return {
    page: query.page,
    limit: query.limit,
    titulo: query.titulo,
    status: query.status,
    onlyPublished: options.onlyPublished,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
  };
}
