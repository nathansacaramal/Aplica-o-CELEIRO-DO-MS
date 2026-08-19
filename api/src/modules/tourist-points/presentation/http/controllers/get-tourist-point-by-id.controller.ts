import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetTouristPointByIdUseCase } from "@/modules/tourist-points/application/use-cases/get-tourist-point-by-id.usecase";
import { toTouristPointHttpPayload } from "../mappers/tourist-point-response.mapper";
import { touristPointLinks, touristPointPublicLinks } from "../tourist-point-hateoas";

export type TouristPointByIdAudience = "admin" | "public";

export class GetTouristPointByIdController implements Controller {
  constructor(
    private readonly useCase: GetTouristPointByIdUseCase,
    private readonly audience: TouristPointByIdAudience = "admin",
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    try {
      const id = Number(req.params?.id);
      if (Number.isNaN(id)) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "INVALID_ID",
            message: "ID inválido",
            statusCode: 400,
          }),
          correlationId,
        );
      }

      const entity = await this.useCase.execute(id);
      const payload = toTouristPointHttpPayload(entity);

      const linkFn = this.audience === "public" ? touristPointPublicLinks : touristPointLinks;
      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(linkFn(entity.id as number))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar ponto turístico", {
        correlationId,
        route: "GetTouristPointByIdController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
