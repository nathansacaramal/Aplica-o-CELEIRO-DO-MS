import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { SITE_LOGO_KEY } from "@/modules/settings/application/dto";
import { UpdateSiteLogoUseCase } from "@/modules/settings/application/use-cases";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { adminSettingLinks } from "../settings-hateoas";

export class UpdateSiteLogoController implements Controller {
  constructor(private readonly updateSiteLogoUseCase: UpdateSiteLogoUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const { image } = request.body as { image: Parameters<UpdateSiteLogoUseCase["execute"]>[0] };
      const updated = await this.updateSiteLogoUseCase.execute(image);

      const resource = new ResourceBuilder<SettingEntity>(updated)
        .addAllLinks(adminSettingLinks(SITE_LOGO_KEY))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao atualizar logo do site", {
        correlationId,
        route: "UpdateSiteLogoController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
