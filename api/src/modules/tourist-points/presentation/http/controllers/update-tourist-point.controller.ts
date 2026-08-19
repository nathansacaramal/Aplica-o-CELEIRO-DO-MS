import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { ok, ResourceBuilder } from "@/core/http/http-resource";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateTouristPointUseCase } from "../../../application/use-cases/update-tourist-point.usecase";
import { touristPointLinks } from "../tourist-point-hateoas";

export class UpdateTouristPointController implements Controller {
  constructor(private readonly useCase: UpdateTouristPointUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    try {
      const id = Number(req.params?.id);
      const updated = await this.useCase.execute(id, { ...req.body });

      if (!updated || !updated.id) {
        logger.warn("UpdatePontoTuristicoController: entidade atualizada é nula", {
          correlationId,
          route: "UpdatePontoTuristicoController",
        });
        return mapErrorToHttpResponse(
          new Error("Erro ao atualizar ponto turístico"),
          correlationId,
        );
      }

      const data = {
        id: updated.id,
        cityId: updated.cityId,
        citySlug: updated.citySlug,
        name: updated.name,
        description: updated.description,
        category: updated.category,
        address: updated.address,
        openingHours: updated.openingHours,
        imageUrl: updated.imageUrl,
        featured: updated.featured, // ✅ obrigatório pela model
        published: updated.published,
      };
      const builder = new ResourceBuilder(data);
      const resource = builder
        .addAllLinks(touristPointLinks(updated.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();

      return ok(resource);
    } catch (error) {
      logger.error("Erro ao atualizar ponto turístico", {
        correlationId,
        route: "UpdatePontoTuristicoController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
