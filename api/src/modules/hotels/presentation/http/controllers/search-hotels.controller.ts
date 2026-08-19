import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { searchHotelsByCity } from "@/modules/hotels/application/services/hotel-search.service";
import type { SearchHotelsQueryDTO } from "../validators/hotels-schemas";

export class SearchHotelsController implements Controller {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const { city, state } = httpRequest.validatedQuery as SearchHotelsQueryDTO;
      const result = await searchHotelsByCity(city, state);

      const resource = new ResourceBuilder(result)
        .addOneLink("self", "GET", "/api/public/hotels")
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("SearchHotelsController: erro ao buscar hotéis", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
