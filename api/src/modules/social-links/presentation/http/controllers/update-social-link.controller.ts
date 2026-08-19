import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { UpdateSocialLinkDTO } from "@/modules/social-links/application/dto";
import { UpdateSocialLinkUseCase } from "@/modules/social-links/application/use-cases/update-social-link.usecase";

export class UpdateSocialLinkController implements Controller {
  constructor(private readonly useCase: UpdateSocialLinkUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.pathParams?.id);
      const body = httpRequest.body as UpdateSocialLinkDTO;
      const updated = await this.useCase.execute(id, body);

      if (!updated) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "SOCIAL_LINK_NOT_FOUND",
            message: "Link social não encontrado",
            statusCode: 404,
            details: { id },
          }),
          correlationId,
        );
      }

      return {
        statusCode: 200,
        body: {
          data: updated,
          links: {},
          meta: { correlationId, version: "1.0.0" },
        },
      };
    } catch (error) {
      logger.error("UpdateSocialLinkController: erro ao atualizar social link", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
