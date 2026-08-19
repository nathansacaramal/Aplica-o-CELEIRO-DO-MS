import authMiddleware from "./auth-middleware";
import authorizeRoles from "./authorize-roles";
import bodyParser from "./body-parser";
import contentType from "./content-type";
import cors from "./cors";
import setupErrorHandlers from "./error-handlers";
import { securityHeaders } from "./security-headers";
import { validateBody } from "./validate-body";
import { correlationIdMiddleware } from "./correlation-id";
import { forceHttpsRedirect } from "./force-https-redirect";

export {
  authMiddleware,
  authorizeRoles,
  bodyParser,
  contentType,
  cors,
  validateBody,
  setupErrorHandlers,
  securityHeaders,
  correlationIdMiddleware,
  forceHttpsRedirect,
};
