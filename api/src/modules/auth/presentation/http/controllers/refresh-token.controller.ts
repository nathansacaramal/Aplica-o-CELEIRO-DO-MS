import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { resource } from "@/core/http/http-resource";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/refresh-token.usecase";
import { refreshTokenLinks } from "../auth-hateoas";

export class RefreshTokenController implements Controller {
  constructor(private readonly useCase: RefreshTokenUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;

    logger.info("Iniciando refresh token", {
      correlationId,
      route: "RefreshTokenController",
    });

    try {
      const token = httpRequest.body?.refreshToken;

      const result = await this.useCase.execute(token);

      const body = resource({ accessToken: result.accessToken }, refreshTokenLinks(), {
        correlationId,
        version: "1.0.0",
      });

      logger.info("Refresh token bem-sucedido", {
        correlationId,
        route: "RefreshTokenController",
      });

      return {
        statusCode: 200,
        body,
      };
    } catch (error) {
      logger.error("Erro ao processar refresh token", {
        correlationId,
        route: "RefreshTokenController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
