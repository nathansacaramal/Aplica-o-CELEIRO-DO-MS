import { logger } from "@/core/config/logger";
import { CollectionResourceBuilder, mapErrorToHttpResponse, ok } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ListSettingsUseCase } from "@/modules/settings/application/use-cases";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { adminSettingsCollectionLinks } from "../settings-hateoas";

export class ListSettingsController implements Controller {
  constructor(private readonly listSettingsUseCase: ListSettingsUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const settings = await this.listSettingsUseCase.execute();
      const resourceBuild = new CollectionResourceBuilder<SettingEntity>(settings);
      const resourceList = resourceBuild
        .addAllLinks(adminSettingsCollectionLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resourceList);
    } catch (error) {
      logger.error("Erro ao listar configurações", {
        correlationId,
        route: "ListSettingsController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
