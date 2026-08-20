import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { Router } from "express-serve-static-core";
import { updateSettingSchema } from "../validators/setting-schemas";
import {
  makeGetPublicMaintenanceModeController,
  makeGetSettingController,
  makeListSettingsController,
  makeUpdateSettingController,
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
  router.patch(
    "/admin/settings/:key",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateSettingSchema),
    adaptRoute(makeUpdateSettingController()),
  );

  // Único endpoint público do módulo: expõe apenas a chave "maintenance_mode",
  // nunca a tabela de configurações inteira (que pode acumular chaves sensíveis
  // no futuro, como credenciais de e-mail/integrações).
  router.get(
    "/public/settings/maintenance-mode",
    adaptRoute(makeGetPublicMaintenanceModeController()),
  );
}
