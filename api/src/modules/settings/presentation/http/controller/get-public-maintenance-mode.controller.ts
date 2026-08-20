import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetPublicMaintenanceModeUseCase } from "@/modules/settings/application/use-cases";
import { publicMaintenanceModeLinks } from "../settings-hateoas";

export class GetPublicMaintenanceModeController implements Controller {
  constructor(private readonly getPublicMaintenanceModeUseCase: GetPublicMaintenanceModeUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const value = await this.getPublicMaintenanceModeUseCase.execute();

      const resource = new ResourceBuilder(value)
        .addAllLinks(publicMaintenanceModeLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar modo de manutenção", {
        correlationId,
        route: "GetPublicMaintenanceModeController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
