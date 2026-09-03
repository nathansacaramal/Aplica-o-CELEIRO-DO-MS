import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { CreateInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/create-institutional-content.usecase";
import { CreateInstitutionalContentDTO } from "@/modules/institutional-content/application/dto";
import { InstitutionalContentEntity } from "@/modules/institutional-content/domain/entities/institutional-content.entity";
import { created, mapErrorToHttpResponse, ResourceBuilder } from "@/core/http";
import { logger } from "@/core/config/logger";
import { AppError } from "@/core/errors-app-error";
import { institutionalContentLinks } from "../institutional-content-hateoas";
import { toInstitutionalContentHttpPayload } from "../mappers/institutional-content-response.mapper";

export class CreateInstitutionalContentController implements Controller {
  constructor(private readonly usecase: CreateInstitutionalContentUseCase) {}
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const body = httpRequest.body as CreateInstitutionalContentDTO;
      const entity = new InstitutionalContentEntity({
        id: 0,
        aboutTitle: body.aboutTitle,
        aboutText: body.aboutText,
        whoWeAreTitle: body.whoWeAreTitle,
        whoWeAreText: body.whoWeAreText,
        purposeTitle: body.purposeTitle,
        purposeText: body.purposeText,
        mission: body.mission,
        vision: body.vision,
        valuesJson: body.valuesJson,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await this.usecase.execute(entity);
      if (!result) {
        return mapErrorToHttpResponse(
          new AppError({
            code: "INSTITUTIONAL_CONTENT_CREATE_FAILED",
            message: "Erro ao criar conteúdo institucional",
            statusCode: 500,
          }),
          correlationId,
        );
      }
      const resource = new ResourceBuilder(toInstitutionalContentHttpPayload(result))
        .addAllLinks(institutionalContentLinks(result.id))
        .addMeta({ correlationId, version: "1.0.0" })
        .build();
      return created(resource);
    } catch (error) {
      logger.error("CreateInstitutionalContentController: erro ao criar", {
        correlationId,
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
