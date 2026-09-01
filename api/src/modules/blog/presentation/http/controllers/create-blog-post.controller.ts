import { logger } from "@/core/config/logger";
import { created, mapErrorToHttpResponse, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { CreateBlogPostUseCase } from "@/modules/blog/application/use-cases/create-blog-post.usecase";
import { CreateBlogPostDTO } from "@/modules/blog/application/dto";
import { toBlogPostHttpPayload } from "../mappers/blog-post-response.mapper";
import { blogPostLinks } from "../blog-post-hateoas";

export class CreateBlogPostController implements Controller {
  constructor(private readonly useCase: CreateBlogPostUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("Iniciando criação de publicação", {
      correlationId,
      route: "CreateBlogPostController",
    });

    try {
      const createdPost = await this.useCase.execute(req.body as CreateBlogPostDTO);
      const payload = toBlogPostHttpPayload(createdPost);

      const resource = new ResourceBuilder(payload)
        .addAllLinks(blogPostLinks(createdPost.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return created(resource);
    } catch (error) {
      logger.error("Erro ao criar publicação", { correlationId, error });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
