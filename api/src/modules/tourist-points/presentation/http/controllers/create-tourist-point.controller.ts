import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { created, mapErrorToHttpResponse, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { CreateTouristPointUseCase } from "../../../application/use-cases/create-tourist-point.usecase";
import { toTouristPointHttpPayload } from "../mappers/tourist-point-response.mapper";
import { touristPointLinks } from "../tourist-point-hateoas";

export class CreateTouristPointController implements Controller {
  constructor(private readonly useCase: CreateTouristPointUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("Criando ponto turístico", {
      correlationId,
      route: "CreateTouristPointController",
    });

    try {
      const createdEntity = await this.useCase.execute(req.body);

      if (!createdEntity?.id) {
        logger.warn("CreateTouristPointController: entidade criada é nula", {
          correlationId,
          route: "CreateTouristPointController",
        });
        return mapErrorToHttpResponse(
          new AppError({
            code: "TOURIST_POINT_CREATE_FAILED",
            message: "Erro ao criar ponto turístico",
            statusCode: 500,
          }),
          correlationId,
        );
      }

      const payload = toTouristPointHttpPayload(createdEntity);
      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(touristPointLinks(createdEntity.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return created(resource);
    } catch (error) {
      logger.error("Erro ao criar ponto turístico", {
        correlationId,
        route: "CreateTouristPointController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
