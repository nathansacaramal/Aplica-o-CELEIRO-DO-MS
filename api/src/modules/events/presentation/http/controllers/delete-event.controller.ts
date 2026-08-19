// src/modules/events/presentation/http/controllers/delete-event.controller.ts
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { noContent } from "@/core/http/http-resource";
import { mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { logger } from "@/core/config/logger";
import { DeleteEventUseCase } from "@/modules/events/application/use-cases/delete-event.usecase";

export class DeleteEventController implements Controller {
  constructor(private readonly useCase: DeleteEventUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("Iniciando delete de evento", {
      correlationId,
      route: "DeleteEventController",
      params: req.params,
    });

    try {
      const id = Number(req.params?.id);

      await this.useCase.execute({ id });

      logger.info("Evento deletado com sucesso", {
        correlationId,
        route: "DeleteEventController",
        eventId: id,
      });

      return noContent();
    } catch (error) {
      logger.error("Erro ao deletar evento", {
        correlationId,
        route: "DeleteEventController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
