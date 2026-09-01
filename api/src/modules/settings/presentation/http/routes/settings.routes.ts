import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { Router } from "express-serve-static-core";
import { updateSettingSchema, updateSiteLogoSchema } from "../validators/setting-schemas";
import {
  makeGetPublicMaintenanceModeController,
  makeGetPublicSiteLogoController,
  makeGetSettingController,
  makeListSettingsController,
  makeUpdateSettingController,
  makeUpdateSiteLogoController,
} from "../factories";

export function registerSettingsRoutes(router: Router): void {
  router.get(
    "/admin/settings",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeListSettingsController()),
  );
  router.get(
    "/admin/settings/:key",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetSettingController()),
  );
  // Rota específica de upload de imagem: precisa vir antes de
  // "/admin/settings/:key" para não ser engolida pelo parâmetro genérico.
  router.patch(
    "/admin/settings/logo",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateSiteLogoSchema),
    adaptRoute(makeUpdateSiteLogoController()),
  );
  router.patch(
    "/admin/settings/:key",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateSettingSchema),
    adaptRoute(makeUpdateSettingController()),
  );

  // Únicos endpoints públicos do módulo: expõem apenas chaves específicas
  // (nunca a tabela de configurações inteira, que pode acumular chaves
  // sensíveis no futuro, como credenciais de e-mail/integrações).
  router.get(
    "/public/settings/maintenance-mode",
    adaptRoute(makeGetPublicMaintenanceModeController()),
  );
  router.get("/public/settings/logo", adaptRoute(makeGetPublicSiteLogoController()));
}
