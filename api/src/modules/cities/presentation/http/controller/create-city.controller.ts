import { logger } from "@/core/config/logger";
import { created, mapErrorToHttpResponse, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest } from "@/core/protocols";
import { CreateCityDTO } from "@/modules/cities/application/dto";
import { CreateCityUseCase } from "@/modules/cities/application/use-cases/create-city.usecase";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";
import { adminCityLinks } from "../city-hateoas";

export class CreateCityController implements Controller {
  constructor(private readonly createCityUseCase: CreateCityUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<any> {
    const correlationId = httpRequest.correlationId;
    logger.info("Iniciando criação de cidade", {
      correlationId,
      route: "CreateCityController",
      body: httpRequest.body,
    });
    try {
      const body = httpRequest.body as CreateCityDTO;
      const city = await this.createCityUseCase.execute(body);
      const resourceBuild = new ResourceBuilder<CityEntity>(city);
      const resource = resourceBuild
        .addAllLinks(adminCityLinks(city.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      logger.info("Cidade criada com sucesso", {
        correlationId,
        route: "CreateCityController",
        cityId: city.id,
        name: city.name,
      });

      return created(resource);
    } catch (error) {
      logger.error("Erro ao criar cidade", {
        correlationId,
        route: "CreateCityController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
