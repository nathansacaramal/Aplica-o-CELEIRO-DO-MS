import adaptRoute from "@/core/adapters/express-route-adapter";
import { Router } from "express";

import { authRateLimiter } from "@/core/http/middlewares/auth-rate-limit";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { loginSchema, refreshTokenSchema } from "../validators/auth-schemas";
import { makeLoginController, makeRefreshTokenController } from "../factories";

export function registerAuthRoutes(router: Router): void {
  router.post(
    "/auth/login",
    authRateLimiter,
    validateBody(loginSchema),
    adaptRoute(makeLoginController()),
  );
  router.post(
    "/auth/refresh-token",
    authRateLimiter,
    validateBody(refreshTokenSchema),
    adaptRoute(makeRefreshTokenController()),
  );
}
