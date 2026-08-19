import merge from "deepmerge";
import path from "path";
import YAML from "yamljs";

const swaggerPath = (...segments: string[]) =>
  path.resolve(__dirname, "..", "docs", "swagger", ...segments);

export function loadSwaggerDocument() {
  const base = YAML.load(swaggerPath("base.yaml"));
  const auth = YAML.load(swaggerPath("auth.yaml"));
  const users = YAML.load(swaggerPath("users.yaml"));
  const media = YAML.load(swaggerPath("media.yaml"));

  const adminCities = YAML.load(swaggerPath("admin.cities.yaml"));
  const adminEvents = YAML.load(swaggerPath("admin.events.yaml"));
  const adminHomeHighlights = YAML.load(swaggerPath("admin.home-highlights.yaml"));
  const adminInstitutional = YAML.load(swaggerPath("admin.institutional.yaml"));
  const adminSocialLinks = YAML.load(swaggerPath("admin.social-links.yaml"));
  const adminTouristPoints = YAML.load(swaggerPath("admin.tourist-points.yaml"));

  const publicCities = YAML.load(swaggerPath("public.cities.yaml"));
  const publicEvents = YAML.load(swaggerPath("public.events.yaml"));
  const publicHomeContent = YAML.load(swaggerPath("public.home-content.yaml"));
  const publicInstitutional = YAML.load(swaggerPath("public.institutional.yaml"));
  const publicSocialLinks = YAML.load(swaggerPath("public.social-links.yaml"));
  const publicTouristPoints = YAML.load(swaggerPath("public.tourist-points.yaml"));

  const doc = merge.all([
    base,
    auth,
    users,
    media,
    adminCities,
    adminEvents,
    adminHomeHighlights,
    adminInstitutional,
    adminSocialLinks,
    adminTouristPoints,
    publicCities,
    publicEvents,
    publicHomeContent,
    publicInstitutional,
    publicSocialLinks,
    publicTouristPoints,
  ]);

  return doc;
}
