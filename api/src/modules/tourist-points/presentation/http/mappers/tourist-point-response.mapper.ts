import type { TouristPointPersistedDTO } from "@/modules/tourist-points/application/dto";
import type { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";

export type TouristPointListItemPayload = ReturnType<typeof toTouristPointHttpPayload> & {
  createdAt?: Date;
  updatedAt?: Date;
};

type TouristPointResponseSource = TouristPointEntity | TouristPointPersistedDTO;

/** Corpo JSON comum para create/get (sem timestamps de auditoria no contrato atual). */
export function toTouristPointHttpPayload(entity: TouristPointResponseSource) {
  return {
    id: entity.id as number,
    cityId: entity.cityId,
    citySlug: entity.citySlug,
    name: entity.name,
    description: entity.description,
    category: entity.category,
    address: entity.address,
    openingHours: entity.openingHours,
    imageUrl: entity.imageUrl,
    featured: entity.featured,
    published: entity.published,
  };
}

/** Item de coleção (listagem) com timestamps opcionais vindos da persistência. */
export function toTouristPointListItemPayload(
  entity: TouristPointEntity,
  timestamps?: { createdAt?: Date; updatedAt?: Date },
): TouristPointListItemPayload {
  return {
    ...toTouristPointHttpPayload(entity),
    ...(timestamps?.createdAt !== undefined ? { createdAt: timestamps.createdAt } : {}),
    ...(timestamps?.updatedAt !== undefined ? { updatedAt: timestamps.updatedAt } : {}),
  };
}
