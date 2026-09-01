import { Router } from "express";
import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { validateQuery } from "@/core/http/middlewares/validate-query";

import { makeListEventsController } from "../factories/make-list-events.controller";
import { makeCreateEventController } from "../factories/make-create-event.controller";
import { makeUpdateEventController } from "../factories/make-update-event.controller";
import { makeDeleteEventController } from "../factories/make-delete-event.controller";
import { makeGetEventByIdController } from "../factories/make-get-event-by-id.controller";
import { makeFindEventBySlugController } from "../factories/make-find-event-by-slug.controller";

import {
  createEventSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from "../validators/event-schemas";

export function registerEventRoutes(router: Router) {
  router.get(
    "/admin/events",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateQuery(listEventsQuerySchema),
    adaptRoute(makeListEventsController("admin")),
  );

  router.get(
    "/admin/events/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetEventByIdController()),
  );

  router.post(
    "/admin/events",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createEventSchema),
    adaptRoute(makeCreateEventController()),
  );

  router.patch(
    "/admin/events/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateEventSchema),
    adaptRoute(makeUpdateEventController()),
  );

  router.delete(
    "/admin/events/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteEventController()),
  );
  router.get(
    "/public/events",
    validateQuery(listEventsQuerySchema),
    adaptRoute(makeListEventsController("public")),
  );
  // Rota pública por id fica sob /by-id/ para não colidir com /public/events/:slug
  // (usada internamente, ex.: resolver destaques da home a partir do referenceId).
  router.get(
    "/public/events/by-id/:id",
    adaptRoute(makeGetEventByIdController()),
  );
  router.get(
    "/public/events/:slug",
    adaptRoute(makeFindEventBySlugController()),
  );
}
