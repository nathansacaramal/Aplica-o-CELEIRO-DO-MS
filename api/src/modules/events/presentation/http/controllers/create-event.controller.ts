import { logger } from "@/core/config/logger";
import { created, mapErrorToHttpResponse, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { CreateEventUseCase } from "@/modules/events/application/use-cases/create-event.usecase";
import { CreateEventDTO } from "@/modules/events/application/dto";
import { toEventHttpPayload } from "../mappers/event-response.mapper";
import { eventLinks } from "../event-hateoas";

export class CreateEventController implements Controller {
  constructor(private readonly useCase: CreateEventUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("Iniciando criação de evento", {
      correlationId,
      route: "CreateEventController",
    });

    try {
      const createdEvent = await this.useCase.execute(req.body as CreateEventDTO);
      const payload = toEventHttpPayload(createdEvent);

      const resourceBuild = new ResourceBuilder(payload);
      const resource = resourceBuild
        .addAllLinks(eventLinks(createdEvent.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return created(resource);
    } catch (error) {
      logger.error("Erro ao criar evento", { correlationId, error });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
