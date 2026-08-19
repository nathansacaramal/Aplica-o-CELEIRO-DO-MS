import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ok, resource } from "@/core/http/http-resource";
import { mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { logger } from "@/core/config/logger";
import { VerifyPublicMediaReadableUseCase } from "../../../application/use-cases/verify-public-media-readable.usecase";
import type { VerifyMediaQueryDTO } from "../validators/media-schemas";

export class VerifyMediaController implements Controller {
  constructor(private readonly useCase: VerifyPublicMediaReadableUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;
    const query = req.validatedQuery as VerifyMediaQueryDTO;

    logger.info("VerifyMediaController: start", {
      correlationId,
      route: "VerifyMediaController",
    });

    try {
      const result = await this.useCase.execute(query.url);
      const resp = resource(
        {
          url: result.url,
          contentType: result.contentType,
          contentLength: result.contentLength,
          readable: true,
        },
        {
          self: { href: "/api/media/verify", method: "GET" },
        },
        { correlationId },
      );
      return ok(resp);
    } catch (err) {
      logger.error("VerifyMediaController: error", {
        correlationId,
        route: "VerifyMediaController",
        err,
      });
      return mapErrorToHttpResponse(err, correlationId);
    }
  }
}
