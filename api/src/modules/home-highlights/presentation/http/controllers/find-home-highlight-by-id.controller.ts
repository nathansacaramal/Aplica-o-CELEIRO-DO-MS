import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { FindHomeHighlightByIdUseCase } from "@/modules/home-highlights/application/use-cases/find-home-highlight-by-id.usecase";
import { AppError } from "@/core/errors-app-error";
import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { homeHighlightLinks } from "../home-highlight-hateoas";
import { toHomeHighlightHttpPayload } from "../mappers/home-highlight-response.mapper";

export class FindHomeHighlightByIdController implements Controller {
  constructor(private readonly usecase: FindHomeHighlightByIdUseCase) {}
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.pathParams?.id);
      const result = await this.usecase.execute(id);
      if (!result) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "HOME_HIGHLIGHT_NOT_FOUND",
            message: "Destaque não encontrado",
            statusCode: 404,
            details: { id },
          }),
          correlationId,
        );
      }
      const payload = toHomeHighlightHttpPayload(result);
      const resource = new ResourceBuilder(payload)
        .addAllLinks(homeHighlightLinks(payload.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("FindHomeHighlightByIdController: erro ao buscar", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
