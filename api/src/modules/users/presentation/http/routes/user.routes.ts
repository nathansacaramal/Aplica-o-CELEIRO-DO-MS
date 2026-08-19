import adaptRoute from "@/core/adapters/express-route-adapter";
import { Router } from "express";

import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { validateQuery } from "@/core/http/middlewares/validate-query";

import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from "../validators/user-schemas";
import {
  makeCreateUserController,
  makeDeleteUserController,
  makeGetUserByIdController,
  makeListUsersController,
  makeUpdateUserController,
} from "../factories";

export function registerUserRoutes(router: Router): void {
  router.post(
    "/admin/users",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createUserSchema),
    adaptRoute(makeCreateUserController()),
  );

  router.get(
    "/admin/users",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateQuery(listUsersQuerySchema),
    adaptRoute(makeListUsersController()),
  );

  router.get(
    "/admin/users/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetUserByIdController()),
  );

  router.patch(
    "/admin/users/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateUserSchema),
    adaptRoute(makeUpdateUserController()),
  );

  router.delete(
    "/admin/users/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteUserController()),
  );
}
