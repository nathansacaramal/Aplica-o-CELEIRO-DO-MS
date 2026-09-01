import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { FindBlogPostBySlugUseCase } from "@/modules/blog/application/use-cases/find-blog-post-by-slug.usecase";
import { toBlogPostHttpPayload } from "../mappers/blog-post-response.mapper";
import { blogPostPublicBySlugLinks } from "../blog-post-hateoas";

export class FindBlogPostBySlugController implements Controller {
  constructor(private readonly useCase: FindBlogPostBySlugUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    try {
      const slug = String(req.params?.slug ?? "");
      const entity = await this.useCase.execute(slug);

      if (!entity) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "BLOG_POST_NOT_FOUND",
            message: `Publicação "${slug}" não encontrada`,
            statusCode: 404,
            details: { slug },
          }),
          correlationId,
        );
      }

      const payload = toBlogPostHttpPayload(entity);
      const resource = new ResourceBuilder(payload)
        .addAllLinks(blogPostPublicBySlugLinks(entity.slug))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar publicação por slug", {
        correlationId,
        route: "FindBlogPostBySlugController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
