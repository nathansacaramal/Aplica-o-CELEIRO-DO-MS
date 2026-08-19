import type { IPublicHomeContentResponse } from "@/services/public-api/publicApi.types";
import { mapHomeHighlightFromApi } from "@/services/api/mappers/homeHighlightFromApi";

export function mapPublicHomeContentFromResource(payload: {
  highlights: Array<Record<string, unknown>>;
}): IPublicHomeContentResponse {
  const highlights = (payload.highlights ?? [])
    .filter((h) => Boolean(h.active))
    .map((h) => mapHomeHighlightFromApi(h))
    .sort((a, b) => a.order - b.order);

  return { highlights };
}
