import { registerAuthRoutes } from "@/modules/auth/presentation/http/routes/auth.routes";
import { registerBlogPostRoutes } from "@/modules/blog/presentation/http/routes/blog-posts.routes";
import { registerCityRoutes } from "@/modules/cities/presentation/http/routes/city.routes";
import { registerEventRoutes } from "@/modules/events/presentation/http/routes/events.routes";
import { registerHomeContentRoutes } from "@/modules/home-content/presentation/http/routes/home-content.routes";
import { registerHomeHighlightsRoutes } from "@/modules/home-highlights/presentation/http/routes/home-highlights.routes";
import { registerHotelsRoutes } from "@/modules/hotels/presentation/http/routes/hotels.routes";
import { registerInstitutionalContentRoutes } from "@/modules/institutional-content/presentation/http/routes/institutional-content.routes";
import { registerMediaRoutes } from "@/modules/media/presentation/http/routes/media.routes";
import { registerSettingsRoutes } from "@/modules/settings/presentation/http/routes/settings.routes";
import { registerSocialLinkRoutes } from "@/modules/social-links/presentation/http/routes/social-link.routes";
import { registerTouristPointsRoutes } from "@/modules/tourist-points/presentation/http/routes/tourist-point.routes";
import { registerUserRoutes } from "@/modules/users/presentation/http/routes/user.routes";
import { Express, Router } from "express";

export default function setupRoutes(app: Express): void {
  const router = Router();

  app.use("/api", router);

  // AUTH
  registerAuthRoutes(router);

  // ADMIN
  registerUserRoutes(router);
  registerTouristPointsRoutes(router);
  registerCityRoutes(router);
  registerMediaRoutes(router);
  registerEventRoutes(router);
  registerBlogPostRoutes(router);
  registerSocialLinkRoutes(router);
  registerHomeHighlightsRoutes(router);
  registerInstitutionalContentRoutes(router);
  registerSettingsRoutes(router);

  // PUBLIC
  registerHomeContentRoutes(router);
  registerHotelsRoutes(router);
}
