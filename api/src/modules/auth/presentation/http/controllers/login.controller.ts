import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.usecase";
import { loginLinks } from "../auth-hateoas";
import { resource } from "@/core/http/http-resource";
import { mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { logger } from "@/core/config/logger";

export class LoginController implements Controller {
  constructor(private readonly useCase: LoginUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;

    logger.info("Iniciando login", {
      correlationId,
      route: "LoginController",
      email: httpRequest.body?.email,
    });

    try {
      const result = await this.useCase.execute({
        email: httpRequest.body.email,
        password: httpRequest.body.password,
      });

      const body = resource(
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
        loginLinks(),
        { correlationId, version: "1.0.0" },
      );

      logger.info("Login bem-sucedido", {
        correlationId,
        route: "LoginController",
        userId: result.user.id,
      });

      return {
        statusCode: 200,
        body,
      };
    } catch (error) {
      logger.error("Erro ao realizar login", {
        correlationId,
        route: "LoginController",
        error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
