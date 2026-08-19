import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, noContent } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { DeleteCityUseCase } from "@/modules/cities/application/use-cases";

export class DeleteCityController implements Controller {
  constructor(private readonly deleteCityUseCase: DeleteCityUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const correlationId = request.correlationId;
    try {
      const cityId = Number(request.params?.id);
      await this.deleteCityUseCase.execute(cityId);
      return noContent();
    } catch (error) {
      logger.error("Erro ao deletar cidade", {
        correlationId,
        route: "DeleteCityController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
