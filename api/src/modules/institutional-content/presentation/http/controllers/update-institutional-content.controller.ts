import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/update-institutional-content.usecase";
import { UpdateInstitutionalContentDTO } from "@/modules/institutional-content/application/dto";
import { AppError } from "@/core/errors-app-error";
import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse } from "@/core/http";

export class UpdateInstitutionalContentController implements Controller {
  constructor(private readonly usecase: UpdateInstitutionalContentUseCase) {}
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.pathParams?.id);
      const body = httpRequest.body as UpdateInstitutionalContentDTO;

      const result = await this.usecase.execute(id, body);
      if (!result) {
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
          data: result,
          links: {},
          meta: { correlationId, version: "1.0.0" },
        },
      };
    } catch (error) {
      logger.error("UpdateInstitutionalContentController: erro ao atualizar", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
