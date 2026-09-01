import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetPublicSiteLogoUseCase } from "@/modules/settings/application/use-cases";
import { publicSiteLogoLinks } from "../settings-hateoas";

export class GetPublicSiteLogoController implements Controller {
  constructor(private readonly getPublicSiteLogoUseCase: GetPublicSiteLogoUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const value = await this.getPublicSiteLogoUseCase.execute();

      const resource = new ResourceBuilder(value)
        .addAllLinks(publicSiteLogoLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar logo do site", {
        correlationId,
        route: "GetPublicSiteLogoController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
