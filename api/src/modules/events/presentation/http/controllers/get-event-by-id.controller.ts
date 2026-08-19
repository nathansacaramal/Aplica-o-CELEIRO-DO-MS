import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetEventByIdUseCase } from "@/modules/events/application/use-cases/get-event-by-id.usecase";
import { toEventHttpPayload } from "../mappers/event-response.mapper";
import { eventPublicLinks } from "../event-hateoas";

export class GetEventByIdController implements Controller {
  constructor(private readonly useCase: GetEventByIdUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    try {
      const id = Number(req.params?.id);
      const entity = await this.useCase.execute(id);
      const payload = toEventHttpPayload(entity);

      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(eventPublicLinks(entity.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar evento por id", {
        correlationId,
        route: "GetEventByIdController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
