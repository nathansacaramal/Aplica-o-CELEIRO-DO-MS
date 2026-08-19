import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, CollectionResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { PublicListCityUsecase } from "@/modules/cities/application/use-cases/public-list-city.usecase";
import { toCityHttpPayload } from "../mappers/city-response.mapper";
import { publicCitiesCollectionLinks } from "../city-hateoas";

export class PublicListCityController implements Controller {
  constructor(private readonly usecase: PublicListCityUsecase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const cities = (await this.usecase.execute()) ?? [];
      const items = cities.map(toCityHttpPayload);
      const builder = new CollectionResourceBuilder(items);
      const resource = builder
        .addAllLinks(publicCitiesCollectionLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao listar cidades (público)", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
