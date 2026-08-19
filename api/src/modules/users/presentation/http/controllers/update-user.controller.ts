import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateUserDTO, UserViewModel } from "@/modules/users/application/dto";
import { UpdateUserUseCase } from "../../../application/use-cases/update-user.usecase";
import { ok, ResourceBuilder } from "@/core/http";
import { userLinks } from "../user-hateoas";

export class UpdateUserController implements Controller {
  constructor(private readonly useCase: UpdateUserUseCase) {}

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

      const body = httpRequest.body as UpdateUserDTO;

      const updated = await this.useCase.execute(id, body);

      if (!updated) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "USER_NOT_FOUND",
            message: "Usuário não encontrado",
            statusCode: 404,
          }),
          correlationId,
        );
      }

      const builder = new ResourceBuilder<UserViewModel>(updated);
      const resource = builder
        .addAllLinks(userLinks(updated.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("UpdateUserController: erro inesperado", {
        correlationId,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
