import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetSettingUseCase } from "@/modules/settings/application/use-cases";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { settingNotFound } from "@/modules/settings/domain/errors/setting-errors";
import { adminSettingLinks } from "../settings-hateoas";

export class GetSettingController implements Controller {
  constructor(private readonly getSettingUseCase: GetSettingUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const key = String(request.params?.key ?? "");
      const setting = await this.getSettingUseCase.execute(key);
      if (!setting) {
        return mapErrorToHttpResponse(settingNotFound(key), correlationId);
      }

      const resource = new ResourceBuilder<SettingEntity>(setting)
        .addAllLinks(adminSettingLinks(key))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar configuração", {
        correlationId,
        route: "GetSettingController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
