import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { toUserViewModel } from "../../../application/mappers/user-view-model.mapper";
import { GetUserByIdUseCase } from "../../../application/use-cases/get-user-by-id.usecase";
import { UserViewModel } from "@/modules/users/application/dto";
import { userLinks } from "../user-hateoas";

export class GetUserByIdController implements Controller {
  constructor(private readonly useCase: GetUserByIdUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.params?.id);

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

      const user = await this.useCase.execute(id);
      const view: UserViewModel = toUserViewModel(user);

      const resourceBuild = new ResourceBuilder<UserViewModel>(view);
      const resource = resourceBuild
        .addAllLinks(userLinks(user.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("GetUserByIdController: erro inesperado", {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
