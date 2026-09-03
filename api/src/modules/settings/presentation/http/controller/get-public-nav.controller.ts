import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetPublicNavUseCase } from "@/modules/settings/application/use-cases";
import { publicNavLinks } from "../settings-hateoas";

export class GetPublicNavController implements Controller {
  constructor(private readonly getPublicNavUseCase: GetPublicNavUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const value = await this.getPublicNavUseCase.execute();

      const resource = new ResourceBuilder(value)
        .addAllLinks(publicNavLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar visibilidade do menu público", {
        correlationId,
        route: "GetPublicNavController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
