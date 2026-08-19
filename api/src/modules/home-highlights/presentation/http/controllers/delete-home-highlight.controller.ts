import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { DeleteHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/delete-home-highlight.usecase";
import { AppError } from "@/core/errors-app-error";
import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse } from "@/core/http";

export class DeleteHomeHighlightController implements Controller {
  constructor(private readonly usecase: DeleteHomeHighlightUseCase) {}
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.pathParams?.id);
      const deleted = await this.usecase.execute(id);
      if (!deleted) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "HOME_HIGHLIGHT_NOT_FOUND",
            message: "Destaque não encontrado",
            statusCode: 404,
            details: { id },
          }),
          correlationId,
        );
      }
      return {
        statusCode: 200,
        body: {
          data: { deleted },
          links: {},
          meta: { correlationId, version: "1.0.0" },
        },
      };
    } catch (error) {
      logger.error("DeleteHomeHighlightController: erro ao excluir", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
