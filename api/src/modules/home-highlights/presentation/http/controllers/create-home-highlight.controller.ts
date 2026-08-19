import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { CreateHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/create-home-highlight.usecase";
import { CreateHomeHighlightDTO } from "@/modules/home-highlights/application/dto";
import { created, mapErrorToHttpResponse, ResourceBuilder } from "@/core/http";
import { logger } from "@/core/config/logger";
import { homeHighlightLinks } from "../home-highlight-hateoas";
import { toHomeHighlightHttpPayload } from "../mappers/home-highlight-response.mapper";

export class CreateHomeHighlightController implements Controller {
  constructor(private readonly usecase: CreateHomeHighlightUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const body = httpRequest.body as CreateHomeHighlightDTO;
      const result = await this.usecase.execute(body);
      if (!result) {
        return mapErrorToHttpResponse(new Error("Falha ao criar destaque"), correlationId);
      }
      const payload = toHomeHighlightHttpPayload(result);
      const resource = new ResourceBuilder(payload)
        .addAllLinks(homeHighlightLinks(payload.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return created(resource);
    } catch (error) {
      logger.error("CreateHomeHighlightController: erro ao criar", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
