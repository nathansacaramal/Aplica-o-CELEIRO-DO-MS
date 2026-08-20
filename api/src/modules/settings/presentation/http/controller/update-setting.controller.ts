import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateSettingUseCase } from "@/modules/settings/application/use-cases";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { adminSettingLinks } from "../settings-hateoas";

export class UpdateSettingController implements Controller {
  constructor(private readonly updateSettingUseCase: UpdateSettingUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const key = String(request.params?.key ?? "");
      const updated = await this.updateSettingUseCase.execute(key, request.body);

      const resource = new ResourceBuilder<SettingEntity>(updated)
        .addAllLinks(adminSettingLinks(key))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao atualizar configuração", {
        correlationId,
        route: "UpdateSettingController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
