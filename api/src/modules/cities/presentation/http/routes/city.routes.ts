import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { Router } from "express-serve-static-core";
import { createCitySchema, updateCitySchema } from "../validators/city-schemas";
import {
  makeCreateCityController,
  makeDeleteCityController,
  makeFindCityByIdController,
  makeFindCityBySlugController,
  makeListCityController,
  makePublicListCityController,
  makeUpdateCityController,
} from "../factories";

export function registerCityRoutes(router: Router): void {
  router.get(
    "/admin/cities",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeListCityController()),
  );
  router.get(
    "/admin/cities/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeFindCityByIdController("admin")),
  );
  router.post(
    "/admin/cities",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createCitySchema),
    adaptRoute(makeCreateCityController()),
  );
  router.patch(
    "/admin/cities/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateCitySchema),
    adaptRoute(makeUpdateCityController()),
  );
  router.delete(
    "/admin/cities/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteCityController()),
  );

  router.get("/public/cities/by-id/:id", adaptRoute(makeFindCityByIdController("public")));
  router.get("/public/cities", adaptRoute(makePublicListCityController()));
  router.get("/public/cities/:slug", adaptRoute(makeFindCityBySlugController()));
}
