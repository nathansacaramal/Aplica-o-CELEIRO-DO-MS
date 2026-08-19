import { logger } from "@/core/config/logger";
import { CollectionResourceBuilder, mapErrorToHttpResponse, ok } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { ListUsersQueryDTO, UserViewModel } from "../../../application/dto";
import { toUserViewModel } from "../../../application/mappers/user-view-model.mapper";
import { ListUsersUseCase } from "../../../application/use-cases/list-users.usecase";
import { toListUsersSearchParams } from "../mappers/list-users-query.mapper";
import { listUsersQuerySchema } from "../validators/user-schemas";
import { usersAdminListLinks } from "../user-hateoas";

export class ListUsersController implements Controller {
  constructor(private readonly useCase: ListUsersUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const correlationId = httpRequest.correlationId;
    try {
      const query: ListUsersQueryDTO =
        (httpRequest.validatedQuery as ListUsersQueryDTO | undefined) ??
        listUsersQuerySchema.parse(httpRequest.query ?? {});

      const params = toListUsersSearchParams(query);
      const result = await this.useCase.execute(params);

      const items = result.items.map(toUserViewModel);
      const links = usersAdminListLinks({
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        filters: {
          ...(query.name !== undefined ? { name: query.name } : {}),
          ...(query.email !== undefined ? { email: query.email } : {}),
        },
        sort: result.sort,
      });

      const meta = {
        total: result.total,
        totalPages: result.totalPages,
        page: result.page,
        limit: result.limit,
        sort: result.sort,
        correlationId,
        version: "1.0.0",
      };

      const builder = new CollectionResourceBuilder<UserViewModel>(items);
      const resourceList = builder.addAllLinks(links).addMeta(meta).build();
      return ok(resourceList);
    } catch (error) {
      logger.error("ListUsersController: erro inesperado", {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      });

      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
