import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { FindEventBySlugUseCase } from "@/modules/events/application/use-cases/find-event-by-slug.usecase";
import { toEventHttpPayload } from "../mappers/event-response.mapper";
import { eventPublicBySlugLinks } from "../event-hateoas";

export class FindEventBySlugController implements Controller {
  constructor(private readonly useCase: FindEventBySlugUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    try {
      const slug = String(req.params?.slug ?? "");
      const entity = await this.useCase.execute(slug);

      if (!entity) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "EVENT_NOT_FOUND",
            message: `Evento "${slug}" não encontrado`,
            statusCode: 404,
            details: { slug },
          }),
          correlationId,
        );
      }

      const payload = toEventHttpPayload(entity);
      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(eventPublicBySlugLinks(entity.slug))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar evento por slug", {
        correlationId,
        route: "FindEventBySlugController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
