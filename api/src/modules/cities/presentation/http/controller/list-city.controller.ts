import { logger } from "@/core/config/logger";
import { CollectionResourceBuilder, mapErrorToHttpResponse, ok } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ListCityUseCase } from "@/modules/cities/application/use-cases";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";
import { adminCitiesCollectionLinks } from "../city-hateoas";

export class ListCityController implements Controller {
  constructor(private readonly listCitiesUseCase: ListCityUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const cities = await this.listCitiesUseCase.execute();
      const resourceBuild = new CollectionResourceBuilder<CityEntity>(cities);
      const resourceList = resourceBuild
        .addAllLinks(adminCitiesCollectionLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resourceList);
    } catch (error) {
      logger.error("Erro ao listar cidades", {
        correlationId,
        route: "ListCidadeController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
