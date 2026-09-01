import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetBlogPostByIdUseCase } from "@/modules/blog/application/use-cases/get-blog-post-by-id.usecase";
import { toBlogPostHttpPayload } from "../mappers/blog-post-response.mapper";
import { blogPostLinks, blogPostPublicLinks } from "../blog-post-hateoas";

export type GetBlogPostByIdAudience = "admin" | "public";

export class GetBlogPostByIdController implements Controller {
  constructor(
    private readonly useCase: GetBlogPostByIdUseCase,
    private readonly audience: GetBlogPostByIdAudience = "admin",
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    try {
      const id = Number(req.params?.id);
      const entity = await this.useCase.execute(id);
      const payload = toBlogPostHttpPayload(entity);

      const links = this.audience === "public" ? blogPostPublicLinks(entity.id) : blogPostLinks(entity.id);

      const resource = new ResourceBuilder(payload)
        .addAllLinks(links)
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar publicação por id", {
        correlationId,
        route: "GetBlogPostByIdController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
