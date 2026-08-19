import { CityEntity } from "../../domain/entities/city.entity";
import { CityModel } from "../models/city-model";

export function cityModelToEntity(m: CityModel): CityEntity {
  return new CityEntity({
    id: m.id,
    name: m.name,
    slug: m.slug,
    state: m.state,
    summary: m.summary,
    description: m.description,
    imageUrl: m.imageUrl,
    published: m.published,
  });
}
