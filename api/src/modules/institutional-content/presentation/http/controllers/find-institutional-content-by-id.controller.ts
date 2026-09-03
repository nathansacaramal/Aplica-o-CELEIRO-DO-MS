import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { FindInstitutionalContentByIdUseCase } from "@/modules/institutional-content/application/use-cases/find-institutional-content-by-id.usecase";
import { AppError } from "@/core/errors-app-error";
import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse, ok, ResourceBuilder } from "@/core/http";
import {
  institutionalContentLinks,
  institutionalContentPublicLinks,
} from "../institutional-content-hateoas";
import { toInstitutionalContentHttpPayload } from "../mappers/institutional-content-response.mapper";

export type InstitutionalContentByIdAudience = "admin" | "public";

export class FindInstitutionalContentByIdController implements Controller {
  constructor(
    private readonly usecase: FindInstitutionalContentByIdUseCase,
    private readonly audience: InstitutionalContentByIdAudience = "admin",
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const id = Number(httpRequest.pathParams?.id);
      const result = await this.usecase.execute(id);
      if (!result) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "INSTITUTIONAL_CONTENT_NOT_FOUND",
            message: "Conteúdo institucional não encontrado",
            statusCode: 404,
            details: { id },
          }),
          correlationId,
        );
      }
      const linkFn =
        this.audience === "public" ? institutionalContentPublicLinks : institutionalContentLinks;
      const resource = new ResourceBuilder(toInstitutionalContentHttpPayload(result))
        .addAllLinks(linkFn(result.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return ok(resource);
    } catch (error) {
      logger.error("FindInstitutionalContentByIdController: erro ao buscar", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
