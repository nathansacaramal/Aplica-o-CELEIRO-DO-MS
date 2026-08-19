import adaptRoute from "@/core/adapters/express-route-adapter";
import { validateQuery } from "@/core/http/middlewares/validate-query";
import { Router } from "express";
import { makeSearchHotelsController } from "../factories/make-search-hotels.controller";
import { searchHotelsQuerySchema } from "../validators/hotels-schemas";

export function registerHotelsRoutes(router: Router): void {
  router.get(
    "/public/hotels",
    validateQuery(searchHotelsQuerySchema),
    adaptRoute(makeSearchHotelsController()),
  );
}
