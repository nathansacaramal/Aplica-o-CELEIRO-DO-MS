import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateEventUseCase } from "@/modules/events/application/use-cases/update-event.usecase";
import { UpdateEventDTO } from "@/modules/events/application/dto";
import { toEventHttpPayload } from "../mappers/event-response.mapper";
import { eventLinks } from "../event-hateoas";

export class UpdateEventController implements Controller {
  constructor(private readonly useCase: UpdateEventUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("Iniciando update de evento", {
      correlationId,
      route: "UpdateEventController",
      params: req.params,
      body: req.body,
    });

    try {
      const id = Number(req.params?.id);
      const body = req.body as UpdateEventDTO;

      const updated = await this.useCase.execute(id, body);
      const payload = toEventHttpPayload(updated);

      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(eventLinks(updated.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      logger.info("Evento atualizado com sucesso", {
        correlationId,
        route: "UpdateEventController",
        eventId: updated.id,
      });

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao atualizar evento", {
        correlationId,
        route: "UpdateEventController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
