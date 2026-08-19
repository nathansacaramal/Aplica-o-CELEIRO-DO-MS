import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, CollectionResourceBuilder } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { GetSocialLinkUseCase } from "@/modules/social-links/application/use-cases/get-social-link.usecase";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";
import {
  socialLinksAdminCollectionLinks,
  socialLinksPublicCollectionLinks,
} from "../social-link-hateoas";

export type SocialLinkListAudience = "admin" | "public";

function toJson(e: SocialLinkEntity) {
  return {
    id: e.id,
    platform: e.platform,
    label: e.label,
    url: e.url,
    active: e.active,
    order: e.order,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export class GetSocialLinkController implements Controller {
  constructor(
    private readonly useCase: GetSocialLinkUseCase,
    private readonly audience: SocialLinkListAudience = "admin",
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const socialLinks = await this.useCase.execute();
      const items = (socialLinks ?? []).map(toJson);
      const links =
        this.audience === "public"
          ? socialLinksPublicCollectionLinks()
          : socialLinksAdminCollectionLinks();
      const resource = new CollectionResourceBuilder(items)
        .addAllLinks(links)
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("GetSocialLinkController: erro ao listar social links", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
