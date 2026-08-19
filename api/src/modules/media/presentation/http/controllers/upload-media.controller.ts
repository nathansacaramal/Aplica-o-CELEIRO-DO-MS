// src/modules/media/presentation/http/controllers/upload-media.controller.ts
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ok, resource } from "@/core/http/http-resource";
import { mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { logger } from "@/core/config/logger";
import { UploadMediaUseCase } from "../../../application/use-cases/upload-media.usecase";
import { mediaLinks } from "../media-hateoas";

export class UploadMediaController implements Controller {
  constructor(private readonly useCase: UploadMediaUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    logger.info("UploadMediaController: start", {
      correlationId,
      route: "UploadMediaController",
    });

    try {
      const result = await this.useCase.execute(req.body as any);

      const resp = resource(
        {
          filename: result.filename,
          mimeType: result.mimeType,
          size: result.size,
          path: result.path,
          url: result.url,
        },
        mediaLinks(),
        { correlationId },
      );

      return ok(resp);
    } catch (err) {
      logger.error("UploadMediaController: error", {
        correlationId,
        route: "UploadMediaController",
        err,
      });

      return mapErrorToHttpResponse(err, correlationId);
    }
  }
}
