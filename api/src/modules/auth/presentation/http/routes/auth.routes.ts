import adaptRoute from "@/core/adapters/express-route-adapter";
import { Router } from "express";

import { validateBody } from "@/core/http/middlewares/validate-body";
import { loginSchema, refreshTokenSchema } from "../validators/auth-schemas";
import { makeLoginController, makeRefreshTokenController } from "../factories";

export function registerAuthRoutes(router: Router): void {
  router.post("/auth/login", validateBody(loginSchema), adaptRoute(makeLoginController()));
  router.post(
    "/auth/refresh-token",
    validateBody(refreshTokenSchema),
    adaptRoute(makeRefreshTokenController()),
  );
}
