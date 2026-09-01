import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { validateQuery } from "@/core/http/middlewares/validate-query";
import { Router } from "express";

import {
  makeCreateTouristPointController,
  makeDeleteTouristPointController,
  makeFindTouristPointBySlugController,
  makeGetTouristPointByIdController,
  makeListTouristPointsController,
  makeUpdateTouristPointController,
} from "../factories";
import {
  createTouristPointSchema,
  listTouristPointsQuerySchema,
  updateTouristPointSchema,
} from "../validators/tourist-point-schemas";

export function registerTouristPointsRoutes(router: Router) {
  router.post(
    "/admin/tourist-points",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createTouristPointSchema),
    adaptRoute(makeCreateTouristPointController()),
  );
  router.get(
    "/admin/tourist-points",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateQuery(listTouristPointsQuerySchema),
    adaptRoute(makeListTouristPointsController("admin")),
  );
  router.get(
    "/admin/tourist-points/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetTouristPointByIdController("admin")),
  );
  router.put(
    "/admin/tourist-points/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateTouristPointSchema),
    adaptRoute(makeUpdateTouristPointController()),
  );
  router.delete(
    "/admin/tourist-points/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteTouristPointController()),
  );

  router.get(
    "/public/tourist-points",
    validateQuery(listTouristPointsQuerySchema),
    adaptRoute(makeListTouristPointsController("public")),
  );
  // Rota pública por id fica sob /by-id/ para não colidir com
  // /public/tourist-points/:slug (usada internamente, ex.: resolver destaques
  // da home a partir do referenceId).
  router.get(
    "/public/tourist-points/by-id/:id",
    adaptRoute(makeGetTouristPointByIdController("public")),
  );
  router.get(
    "/public/tourist-points/:slug",
    adaptRoute(makeFindTouristPointBySlugController()),
  );
}
