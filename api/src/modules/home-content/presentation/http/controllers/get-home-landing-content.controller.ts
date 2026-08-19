import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { homeLandingContentLinks } from "../home-content-hateoas";
import { GetHomeLandingContentUseCase } from "@/modules/home-content/application/use-cases/get-home-landing-content.usecase";
import { HomeHighlightEntity } from "@/modules/home-highlights/domain/entities/home-highlight.entity";

function highlightToJson(h: HomeHighlightEntity) {
  return {
    id: h.id,
    type: h.type,
    referenceId: h.referenceId,
    title: h.title,
    description: h.description,
    cityName: h.cityName,
    imageUrl: h.imageUrl,
    ctaUrl: h.ctaUrl,
    active: h.active,
    order: h.order,
  };
}

export class GetHomeLandingContentController implements Controller {
  constructor(private readonly usecase: GetHomeLandingContentUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const { highlights } = await this.usecase.execute();
      const payload = {
        highlights: highlights.map(highlightToJson),
      };
      const resource = new ResourceBuilder(payload)
        .addAllLinks(homeLandingContentLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("GetHomeLandingContentController: erro ao montar landing", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
