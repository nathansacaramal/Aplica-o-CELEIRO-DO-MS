import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { FindTouristPointBySlugUseCase } from "@/modules/tourist-points/application/use-cases/find-tourist-point-by-slug.usecase";
import { toTouristPointHttpPayload } from "../mappers/tourist-point-response.mapper";
import { touristPointPublicBySlugLinks } from "../tourist-point-hateoas";

export class FindTouristPointBySlugController implements Controller {
  constructor(private readonly useCase: FindTouristPointBySlugUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    try {
      const slug = String(req.params?.slug ?? "");
      const entity = await this.useCase.execute(slug);

      if (!entity) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "PONTO_TURISTICO_NOT_FOUND",
            message: `Ponto turístico "${slug}" não encontrado`,
            statusCode: 404,
            details: { slug },
          }),
          correlationId,
        );
      }

      const payload = toTouristPointHttpPayload(entity);
      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(touristPointPublicBySlugLinks(entity.slug))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar ponto turístico por slug", {
        correlationId,
        route: "FindTouristPointBySlugController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
