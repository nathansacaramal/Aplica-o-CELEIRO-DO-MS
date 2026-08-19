import { Router } from "express";
import adaptRoute from "@/core/adapters/express-route-adapter";

import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { validateQuery } from "@/core/http/middlewares/validate-query";

import { uploadMediaSchema, verifyMediaQuerySchema } from "../validators/media-schemas";
import { makeUploadMediaController, makeVerifyMediaController } from "../factories";

export function registerMediaRoutes(router: Router) {
  router.get(
    "/media/verify",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateQuery(verifyMediaQuerySchema),
    adaptRoute(makeVerifyMediaController()),
  );

  router.post(
    "/media",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(uploadMediaSchema),
    adaptRoute(makeUploadMediaController()),
  );
}
