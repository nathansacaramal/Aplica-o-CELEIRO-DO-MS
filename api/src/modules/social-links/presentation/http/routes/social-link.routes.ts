import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { Router } from "express";
import {
  makeCreateSocialLinkController,
  makeDeleteSocialLinkController,
  makeFindSocialLinkByIdController,
  makeGetSocialLinkController,
  makeUpdateSocialLinkController,
} from "../factories/controllers";
import { createSocialLinkSchema, updateSocialLinkSchema } from "../validators/social-link.schemas";

export function registerSocialLinkRoutes(router: Router): void {
  router.get(
    "/admin/social-links",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetSocialLinkController("admin")),
  );

  router.post(
    "/admin/social-links",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createSocialLinkSchema),
    adaptRoute(makeCreateSocialLinkController()),
  );

  router.get(
    "/admin/social-links/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeFindSocialLinkByIdController("admin")),
  );

  router.patch(
    "/admin/social-links/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateSocialLinkSchema),
    adaptRoute(makeUpdateSocialLinkController()),
  );

  router.delete(
    "/admin/social-links/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteSocialLinkController()),
  );

  router.get("/public/social-links", adaptRoute(makeGetSocialLinkController("public")));
  router.get("/public/social-links/:id", adaptRoute(makeFindSocialLinkByIdController("public")));
}
