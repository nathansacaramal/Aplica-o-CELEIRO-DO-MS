import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { Router } from "express";
import {
  makeCreateInstitutionalContentController,
  makeDeleteInstitutionalContentController,
  makeFindInstitutionalContentByIdController,
  makeGetInstitutionalContentController,
  makeUpdateInstitutionalContentController,
} from "../factories/controllers";
import {
  createInstitutionalContentSchema,
  updateInstitutionalContentSchema,
} from "../validators/institutional-content-schema";

const ADMIN_PREFIX = "/admin";
export function registerInstitutionalContentRoutes(router: Router) {
  router.get(
    "/public/institutional-content",
    adaptRoute(makeGetInstitutionalContentController("public")),
  );
  router.get(
    "/public/institutional-content/:id",
    adaptRoute(makeFindInstitutionalContentByIdController("public")),
  );

  router.get(
    `${ADMIN_PREFIX}/institutional-content`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetInstitutionalContentController("admin")),
  );
  router.post(
    `${ADMIN_PREFIX}/institutional-content`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createInstitutionalContentSchema),
    adaptRoute(makeCreateInstitutionalContentController()),
  );
  router.get(
    `${ADMIN_PREFIX}/institutional-content/:id`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeFindInstitutionalContentByIdController("admin")),
  );
  router.patch(
    `${ADMIN_PREFIX}/institutional-content/:id`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateInstitutionalContentSchema),
    adaptRoute(makeUpdateInstitutionalContentController()),
  );
  router.delete(
    `${ADMIN_PREFIX}/institutional-content/:id`,
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteInstitutionalContentController()),
  );
}
