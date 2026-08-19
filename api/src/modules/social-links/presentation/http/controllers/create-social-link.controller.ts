import { logger } from "@/core/config/logger";
import { created, mapErrorToHttpResponse } from "@/core/http";
import { socialLinkAdminLinks } from "../social-link-hateoas";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { CreateSocialLinkDTO } from "@/modules/social-links/application/dto";
import { CreateSocialLinkUseCase } from "@/modules/social-links/application/use-cases/create-social-link.usecase";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";

export class CreateSocialLinkController implements Controller {
  constructor(private readonly useCase: CreateSocialLinkUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const body = httpRequest.body as CreateSocialLinkDTO;
      const entity = new SocialLinkEntity({
        id: 0,
        platform: body.platform,
        label: body.label,
        url: body.url,
        active: body.active,
        order: body.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdSocialLink = await this.useCase.execute(entity);
      if (!createdSocialLink) {
        return mapErrorToHttpResponse(new Error("Falha ao criar social link"), correlationId);
      }
      const data = {
        id: createdSocialLink.id,
        platform: createdSocialLink.platform,
        label: createdSocialLink.label,
        url: createdSocialLink.url,
        active: createdSocialLink.active,
        order: createdSocialLink.order,
        createdAt: createdSocialLink.createdAt,
        updatedAt: createdSocialLink.updatedAt,
      };
      return created({
        data,
        links: socialLinkAdminLinks(createdSocialLink.id),
        meta: { correlationId },
      });
    } catch (error) {
      logger.error("CreateSocialLinkController: erro ao criar social link", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
