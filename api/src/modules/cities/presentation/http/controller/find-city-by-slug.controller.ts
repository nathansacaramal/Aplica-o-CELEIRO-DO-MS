import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { FindCityBySlugUsecase } from "@/modules/cities/application/use-cases/find-city-by-slug.usecase";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";
import { publicCityBySlugLinks } from "../city-hateoas";

function cityToJson(c: CityEntity) {
  return {
    id: c.id,
    name: c.name,
    state: c.state,
    slug: c.slug,
    summary: c.summary,
    description: c.description,
    imageUrl: c.imageUrl,
    published: c.published,
  };
}

export class FindCityBySlugController implements Controller {
  constructor(private readonly usecase: FindCityBySlugUsecase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    const slug = String(httpRequest.params?.slug ?? httpRequest.pathParams?.slug);
    try {
      const city = await this.usecase.execute(slug);
      if (!city) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "CITY_NOT_FOUND",
            message: "Cidade não encontrada",
            statusCode: 404,
            details: { slug },
          }),
          correlationId,
        );
      }
      const resource = new ResourceBuilder(cityToJson(city))
        .addAllLinks(publicCityBySlugLinks(city.slug))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("Erro ao buscar cidade por slug", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
