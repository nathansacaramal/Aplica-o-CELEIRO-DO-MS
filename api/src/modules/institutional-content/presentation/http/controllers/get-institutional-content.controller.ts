import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/get-institutional-content.usecase";
import { mapErrorToHttpResponse, ok, CollectionResourceBuilder } from "@/core/http";
import { logger } from "@/core/config/logger";
import { InstitutionalContentEntity } from "@/modules/institutional-content/domain/entities/institutional-content.entity";
import {
  institutionalContentCollectionLinks,
  institutionalContentPublicCollectionLinks,
} from "../institutional-content-hateoas";

export type InstitutionalContentListAudience = "admin" | "public";

function toJson(e: InstitutionalContentEntity) {
  return {
    id: e.id,
    aboutTitle: e.aboutTitle,
    aboutText: e.aboutText,
    whoWeAreTitle: e.whoWeAreTitle,
    whoWeAreText: e.whoWeAreText,
    purposeTitle: e.purposeTitle,
    purposeText: e.purposeText,
    mission: e.mission,
    vision: e.vision,
    valuesJson: e.valuesJson,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export class GetInstitutionalContentController implements Controller {
  constructor(
    private readonly usecase: GetInstitutionalContentUseCase,
    private readonly audience: InstitutionalContentListAudience = "admin",
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const result = await this.usecase.execute();
      const items = (result ?? []).map(toJson);
      const links =
        this.audience === "public"
          ? institutionalContentPublicCollectionLinks()
          : institutionalContentCollectionLinks();
      const resource = new CollectionResourceBuilder(items)
        .addAllLinks(links)
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("GetInstitutionalContentController: erro ao listar", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
