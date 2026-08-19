import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateCityUseCase } from "@/modules/cities/application/use-cases";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";
import { adminCityLinks } from "../city-hateoas";

export class UpdateCityController implements Controller {
  constructor(private readonly updateCityUseCase: UpdateCityUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const cityId = Number(request.params?.id);
      const updatedCity = await this.updateCityUseCase.execute(cityId, request.body);
      if (!updatedCity) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "CIDADE_NOT_FOUND",
            message: `Cidade ${cityId} não encontrada`,
            statusCode: 404,
            details: { id: cityId },
          }),
          correlationId,
        );
      }
      const resourceBuild = new ResourceBuilder<CityEntity>(updatedCity);
      const resource = resourceBuild
        .addAllLinks(adminCityLinks(updatedCity.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao atualizar cidade", {
        correlationId,
        route: "UpdateCidadeController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
