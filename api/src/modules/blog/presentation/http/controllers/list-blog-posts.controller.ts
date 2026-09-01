import { logger } from "@/core/config/logger";
import { CollectionResourceBuilder, mapErrorToHttpResponse, ok } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ListBlogPostsUseCase } from "@/modules/blog/application/use-cases/list-blog-posts.usecase";
import { blogPostListLinks, blogPostPublicListLinks } from "../blog-post-hateoas";
import { toListBlogPostsUseCaseInput } from "../mappers/list-blog-posts-query.mapper";
import { toBlogPostHttpPayload } from "../mappers/blog-post-response.mapper";
import { listBlogPostsQuerySchema, type ListBlogPostsQueryDTO } from "../validators/blog-post-schemas";

type BlogPostListItemPayload = ReturnType<typeof toBlogPostHttpPayload>;

export type BlogPostsListAudience = "admin" | "public";

export class ListBlogPostsController implements Controller {
  constructor(
    private readonly useCase: ListBlogPostsUseCase,
    private readonly audience: BlogPostsListAudience = "admin",
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;

    try {
      const query: ListBlogPostsQueryDTO =
        (httpRequest.validatedQuery as ListBlogPostsQueryDTO | undefined) ??
        listBlogPostsQuerySchema.parse(httpRequest.query ?? {});

      const onlyPublished = this.audience === "public";
      const useCaseInput = toListBlogPostsUseCaseInput(query, { onlyPublished });
      const result = await this.useCase.execute(useCaseInput);

      const data = result.items.map<BlogPostListItemPayload>((p) => toBlogPostHttpPayload(p));

      const listParams = {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        filters: {
          ...(useCaseInput.titulo !== undefined && { titulo: useCaseInput.titulo }),
          ...(!onlyPublished && useCaseInput.status !== undefined && { status: useCaseInput.status }),
        },
        sort: useCaseInput.sortBy
          ? { by: useCaseInput.sortBy, dir: useCaseInput.sortDir as "asc" | "desc" }
          : undefined,
      };
      const links = onlyPublished ? blogPostPublicListLinks(listParams) : blogPostListLinks(listParams);

      const meta = {
        total: result.total,
        totalPages: result.totalPages,
        page: result.page,
        limit: result.limit,
        sort: result.sort,
        correlationId,
        version: "1.0.0",
      };
      const collectionResource = new CollectionResourceBuilder<BlogPostListItemPayload>(data)
        .addAllLinks(links)
        .addMeta(meta)
        .build();

      return ok(collectionResource);
    } catch (error) {
      logger.error("Erro ao listar publicações", {
        correlationId,
        route: "ListBlogPostsController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
