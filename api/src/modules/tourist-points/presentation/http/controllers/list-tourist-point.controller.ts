import { logger } from "@/core/config/logger";
import { buildPaginationLinks } from "@/core/http/hateoas/pagination-links";
import { CollectionResourceBuilder, Links, mapErrorToHttpResponse, ok } from "@/core/http";
import { Controller, HttpRequest, HttpResponse } from "@/core/protocols";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";
import { ListTouristPointsUseCase } from "../../../application/use-cases/list-tourist-points.usecase";
import { toListTouristPointsUseCaseInput } from "../mappers/list-tourist-points-query.mapper";
import { toTouristPointListItemPayload } from "../mappers/tourist-point-response.mapper";
import {
  touristPointsCollectionLinks,
  touristPointsPublicCollectionLinks,
} from "../tourist-point-hateoas";
import {
  listTouristPointsQuerySchema,
  type ListTouristPointsQueryDTO,
} from "../validators/tourist-point-schemas";

export type TouristPointsListAudience = "admin" | "public";

type TouristPointListRow = TouristPointEntity & {
  createdAt?: Date;
  updatedAt?: Date;
};

export class ListTouristPointsController implements Controller {
  constructor(
    private readonly useCase: ListTouristPointsUseCase,
    private readonly audience: TouristPointsListAudience = "admin",
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const correlationId = req.correlationId;

    const query: ListTouristPointsQueryDTO =
      (req.validatedQuery as ListTouristPointsQueryDTO | undefined) ??
      listTouristPointsQuerySchema.parse(req.query ?? {});

    logger.info("Listando pontos turísticos", {
      correlationId,
      route: "ListTouristPointsController",
      query,
    });

    try {
      const result = await this.useCase.execute(toListTouristPointsUseCaseInput(query));

      const rows = result.items as TouristPointListRow[];
      const data = rows.map((item) =>
        toTouristPointListItemPayload(item, {
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
      );

      const basePath =
        this.audience === "public" ? "/api/public/tourist-points" : "/api/admin/tourist-points";

      const paginationLinks = buildPaginationLinks({
        basePath,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        query: {
          name: query.name,
          city: query.city,
          state: query.state,
          published: query.published,
          sortBy: query.sortBy,
          sortDir: query.sortDir,
        },
      });

      const collectionExtras: Links =
        this.audience === "admin"
          ? touristPointsCollectionLinks()
          : touristPointsPublicCollectionLinks();

      const links: Links = {
        ...collectionExtras,
        ...paginationLinks,
      };

      const meta = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        sort: result.sort,
        correlationId,
        version: "1.0.0",
      };
      const resourceBuild = new CollectionResourceBuilder(data);
      const collectionResource = resourceBuild.addAllLinks(links).addMeta(meta).build();

      return ok(collectionResource);
    } catch (error) {
      logger.error("Erro ao listar pontos turísticos", {
        correlationId,
        route: "ListTouristPointsController",
        error,
      });
      return mapErrorToHttpResponse(error, correlationId);
    }
  }
}
