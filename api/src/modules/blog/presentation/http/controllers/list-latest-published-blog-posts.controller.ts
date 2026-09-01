import { logger } from "@/core/config/logger";
import { CollectionResourceBuilder, mapErrorToHttpResponse, ok } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ListLatestPublishedBlogPostsUseCase } from "@/modules/blog/application/use-cases/list-latest-published-blog-posts.usecase";
import { toBlogPostHttpPayload } from "../mappers/blog-post-response.mapper";
import { blogPostLatestLinks } from "../blog-post-hateoas";
import {
  listLatestBlogPostsQuerySchema,
  type ListLatestBlogPostsQueryDTO,
} from "../validators/blog-post-schemas";

type BlogPostListItemPayload = ReturnType<typeof toBlogPostHttpPayload>;

export class ListLatestPublishedBlogPostsController implements Controller {
  constructor(private readonly useCase: ListLatestPublishedBlogPostsUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;

    try {
      const query: ListLatestBlogPostsQueryDTO =
        (httpRequest.validatedQuery as ListLatestBlogPostsQueryDTO | undefined) ??
        listLatestBlogPostsQuerySchema.parse(httpRequest.query ?? {});

      const items = await this.useCase.execute(query.limit);
      const data = items.map<BlogPostListItemPayload>((p) => toBlogPostHttpPayload(p));

      const collectionResource = new CollectionResourceBuilder<BlogPostListItemPayload>(data)
        .addAllLinks(blogPostLatestLinks())
        .addMeta({ total: data.length, correlationId, version: "1.0.0" })
        .build();

      return ok(collectionResource);
    } catch (error) {
      logger.error("Erro ao listar últimas publicações", {
        correlationId,
        route: "ListLatestPublishedBlogPostsController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
