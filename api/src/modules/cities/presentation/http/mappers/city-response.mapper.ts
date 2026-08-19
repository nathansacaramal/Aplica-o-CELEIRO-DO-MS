import type { CityEntity } from "@/modules/cities/domain/entities/city.entity";

/** Corpo JSON seguro para APIs admin/público (sem campos internos). */
export function toCityHttpPayload(city: CityEntity) {
  return {
    id: city.id,
    name: city.name,
    state: city.state,
    slug: city.slug,
    summary: city.summary,
    description: city.description,
    imageUrl: city.imageUrl,
    published: city.published,
  };
}
