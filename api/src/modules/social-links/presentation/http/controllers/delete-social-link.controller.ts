import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { mapErrorToHttpResponse } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { DeleteSocialLinkUseCase } from "@/modules/social-links/application/use-cases/delete-social-link.usecase";

export class DeleteSocialLinkController implements Controller {
  constructor(private readonly useCase: DeleteSocialLinkUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.pathParams?.id);
      const deleted = await this.useCase.execute(id);

      if (!deleted) {
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
          data: { deleted },
          links: {},
          meta: { correlationId, version: "1.0.0" },
        },
      };
    } catch (error) {
      logger.error("DeleteSocialLinkController: erro ao deletar social link", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
