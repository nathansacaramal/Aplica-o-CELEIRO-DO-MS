import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { noContent } from "@/core/http/http-resource";
import { mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { logger } from "@/core/config/logger";
import { DeleteBlogPostUseCase } from "@/modules/blog/application/use-cases/delete-blog-post.usecase";

export class DeleteBlogPostController implements Controller {
  constructor(private readonly useCase: DeleteBlogPostUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("Iniciando delete de publicação", {
      correlationId,
      route: "DeleteBlogPostController",
      params: req.params,
    });

    try {
      const id = Number(req.params?.id);

      await this.useCase.execute({ id });

      logger.info("Publicação deletada com sucesso", {
        correlationId,
        route: "DeleteBlogPostController",
        postId: id,
      });

      return noContent();
    } catch (error) {
      logger.error("Erro ao deletar publicação", {
        correlationId,
        route: "DeleteBlogPostController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
