import { logger } from "@/core/config/logger";
import { CollectionResourceBuilder, mapErrorToHttpResponse, ok } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ListEventsUseCase } from "@/modules/events/application/use-cases/list-events.usecase";
import { eventListLinks, eventPublicListLinks } from "../event-hateoas";
import { toListEventsUseCaseInput } from "../mappers/list-events-query.mapper";
import { toEventHttpPayload } from "../mappers/event-response.mapper";
import { listEventsQuerySchema, type ListEventsQueryDTO } from "../validators/event-schemas";

type EventListItemPayload = ReturnType<typeof toEventHttpPayload>;

export type EventsListAudience = "admin" | "public";

export class ListEventsController implements Controller {
  constructor(
    private readonly useCase: ListEventsUseCase,
    private readonly audience: EventsListAudience = "admin",
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;

    try {
      const query: ListEventsQueryDTO =
        (httpRequest.validatedQuery as ListEventsQueryDTO | undefined) ??
        listEventsQuerySchema.parse(httpRequest.query ?? {});

      const useCaseInput = toListEventsUseCaseInput(query);
      const result = await this.useCase.execute(useCaseInput);

      const data = result.items.map<EventListItemPayload>((e) => toEventHttpPayload(e));

      const listParams = {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        filters: {
          ...(useCaseInput.name !== undefined && { name: useCaseInput.name }),
          ...(useCaseInput.category !== undefined && {
            category: useCaseInput.category,
          }),
          ...(useCaseInput.cityId !== undefined && {
            cityId: useCaseInput.cityId,
          }),
        },
        sort: useCaseInput.sortBy
          ? {
              by: useCaseInput.sortBy,
              dir: useCaseInput.sortDir as "asc" | "desc",
            }
          : undefined,
      };
      const links =
        this.audience === "public" ? eventPublicListLinks(listParams) : eventListLinks(listParams);

      const meta = {
        total: result.total,
        totalPages: result.totalPages,
        page: result.page,
        limit: result.limit,
        sort: result.sort,
        correlationId,
        version: "1.0.0",
      };
      const resourceBuild = new CollectionResourceBuilder<EventListItemPayload>(data);
      const collectionResource = resourceBuild.addAllLinks(links).addMeta(meta).build();

      return ok(collectionResource);
    } catch (error) {
      logger.error("Erro ao listar eventos", {
        correlationId,
        route: "ListEventsController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
