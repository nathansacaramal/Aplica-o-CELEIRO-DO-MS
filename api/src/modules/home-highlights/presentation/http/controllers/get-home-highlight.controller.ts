import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/get-home-highlight.usecase";
import { CollectionResourceBuilder, mapErrorToHttpResponse, ok } from "@/core/http";
import { logger } from "@/core/config/logger";
import { homeHighlightsCollectionLinks } from "../home-highlight-hateoas";
import { toHomeHighlightHttpPayload } from "../mappers/home-highlight-response.mapper";

export class GetHomeHighlightController implements Controller {
  constructor(private readonly usecase: GetHomeHighlightUseCase) {}
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const result = await this.usecase.execute();
      const items = (result ?? []).map(toHomeHighlightHttpPayload);
      const resource = new CollectionResourceBuilder(items)
        .addAllLinks(homeHighlightsCollectionLinks())
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("GetHomeHighlightController: erro ao listar", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
