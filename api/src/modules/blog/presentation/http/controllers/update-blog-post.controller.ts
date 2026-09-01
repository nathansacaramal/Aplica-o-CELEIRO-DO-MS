import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateBlogPostUseCase } from "@/modules/blog/application/use-cases/update-blog-post.usecase";
import { UpdateBlogPostDTO } from "@/modules/blog/application/dto";
import { toBlogPostHttpPayload } from "../mappers/blog-post-response.mapper";
import { blogPostLinks } from "../blog-post-hateoas";

export class UpdateBlogPostController implements Controller {
  constructor(private readonly useCase: UpdateBlogPostUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("Iniciando update de publicação", {
      correlationId,
      route: "UpdateBlogPostController",
      params: req.params,
    });

    try {
      const id = Number(req.params?.id);
      const body = req.body as UpdateBlogPostDTO;

      const updated = await this.useCase.execute(id, body);
      const payload = toBlogPostHttpPayload(updated);

      const resource = new ResourceBuilder(payload)
        .addAllLinks(blogPostLinks(updated.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao atualizar publicação", {
        correlationId,
        route: "UpdateBlogPostController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
