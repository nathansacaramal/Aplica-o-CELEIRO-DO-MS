import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { DeleteInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/delete-institutional-content.usecase";
import { AppError } from "@/core/errors-app-error";
import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse } from "@/core/http";

export class DeleteInstitutionalContentController implements Controller {
  constructor(private readonly usecase: DeleteInstitutionalContentUseCase) {}
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.pathParams?.id);
      const deleted = await this.usecase.execute(id);
      if (!deleted) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "INSTITUTIONAL_CONTENT_NOT_FOUND",
            message: "Conteúdo institucional não encontrado",
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
      logger.error("DeleteInstitutionalContentController: erro ao excluir", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
