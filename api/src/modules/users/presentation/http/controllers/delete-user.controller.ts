import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, noContent } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { DeleteUserUseCase } from "../../../application/use-cases/delete-user.usecase";

export class DeleteUserController implements Controller {
  constructor(private readonly useCase: DeleteUserUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.params.id);

      if (Number.isNaN(id)) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "INVALID_ID",
            message: "ID inválido",
            statusCode: 400,
          }),
          correlationId,
        );
      }

      const deleted = await this.useCase.execute(id);

      if (!deleted) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "USER_NOT_FOUND",
            message: "Usuário não encontrado",
            statusCode: 404,
          }),
          correlationId,
        );
      }

      logger.info("DeleteUserController: usuário deletado", { id });

      return noContent();
    } catch (error) {
      logger.error("DeleteUserController: erro inesperado", {
        correlationId,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
