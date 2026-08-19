import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { FindCityByIdUseCase } from "@/modules/cities/application/use-cases/find-city-by-id.usecase";
import { toCityHttpPayload } from "../mappers/city-response.mapper";
import { adminCityLinks, publicCityByIdLinks } from "../city-hateoas";

export type FindCityByIdAudience = "admin" | "public";

export class FindCityByIdController implements Controller {
  constructor(
    private readonly findCityByIdUseCase: FindCityByIdUseCase,
    private readonly audience: FindCityByIdAudience = "admin",
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const cityId = Number(request.params?.id);
      if (Number.isNaN(cityId)) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "INVALID_ID",
            message: "ID inválido",
            statusCode: 400,
          }),
          correlationId,
        );
      }

      const city = await this.findCityByIdUseCase.execute(cityId);
      if (this.audience === "public" && !city.published) {
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
      const payload = toCityHttpPayload(city);

      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(
          this.audience === "public"
            ? publicCityByIdLinks(city.id ?? cityId)
            : adminCityLinks(city.id),
        )
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar cidade", {
        correlationId,
        route: "FindCityByIdController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
