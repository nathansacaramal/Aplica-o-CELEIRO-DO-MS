import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { Router } from "express";
import {
  makeCreateHomeHighlightController,
  makeDeleteHomeHighlightController,
  makeFindHomeHighlightByIdController,
  makeGetHomeHighlightController,
  makeUpdateHomeHighlightController,
} from "../factories/controllers";
import {
  createHomeHighlightSchema,
  updateHomeHighlightSchema,
} from "../validators/home-highlights.schemas";

const ADMIN_PREFIX = "/admin";
export function registerHomeHighlightsRoutes(router: Router): void {
  router.get(
    `${ADMIN_PREFIX}/home-highlights`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetHomeHighlightController()),
  );
  router.post(
    `${ADMIN_PREFIX}/home-highlights`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createHomeHighlightSchema),
    adaptRoute(makeCreateHomeHighlightController()),
  );
  router.get(
    `${ADMIN_PREFIX}/home-highlights/:id`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeFindHomeHighlightByIdController()),
  );
  router.patch(
    `${ADMIN_PREFIX}/home-highlights/:id`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateHomeHighlightSchema),
    adaptRoute(makeUpdateHomeHighlightController()),
  );
  router.delete(
    `${ADMIN_PREFIX}/home-highlights/:id`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteHomeHighlightController()),
  );
}
