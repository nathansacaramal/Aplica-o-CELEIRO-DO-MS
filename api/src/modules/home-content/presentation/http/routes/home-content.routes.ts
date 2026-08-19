import adaptRoute from "@/core/adapters/express-route-adapter";
import { Router } from "express";
import { makeGetHomeLandingContentController } from "../factories";

export function registerHomeContentRoutes(router: Router): void {
  router.get("/public/home-content", adaptRoute(makeGetHomeLandingContentController()));
}
