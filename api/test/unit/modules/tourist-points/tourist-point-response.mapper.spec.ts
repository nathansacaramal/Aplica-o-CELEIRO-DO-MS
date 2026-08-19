import type { TouristPointPersistedDTO } from "@/modules/tourist-points/application/dto";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";
import {
  toTouristPointHttpPayload,
  toTouristPointListItemPayload,
} from "@/modules/tourist-points/presentation/http/mappers/tourist-point-response.mapper";

describe("tourist-point-response.mapper", () => {
  const entity = new TouristPointEntity({
    id: 7,
    cityId: 1,
    citySlug: "cg",
    name: "Museu",
    description: "D",
    category: "museu",
    address: "A",
    openingHours: "09:00",
    imageUrl: "https://x.com/i.jpg",
    featured: false,
    published: true,
  });

  const dto: TouristPointPersistedDTO = {
    id: 7,
    cityId: 1,
    citySlug: "cg",
    name: "Museu",
    description: "D",
    category: "museu",
    address: "A",
    openingHours: "09:00",
    imageUrl: "https://x.com/i.jpg",
    featured: false,
    published: true,
  };

  it("toTouristPointHttpPayload aceita Entity", () => {
    expect(toTouristPointHttpPayload(entity).name).toBe("Museu");
  });

  it("toTouristPointHttpPayload aceita DTO persistido", () => {
    expect(toTouristPointHttpPayload(dto).id).toBe(7);
  });

  it("toTouristPointListItemPayload inclui timestamps opcionais", () => {
    const c = new Date("2024-01-01");
    const u = new Date("2024-01-02");
    expect(toTouristPointListItemPayload(entity, { createdAt: c, updatedAt: u })).toMatchObject({
      createdAt: c,
      updatedAt: u,
    });
  });

  it("toTouristPointListItemPayload omite timestamps quando undefined", () => {
    const out = toTouristPointListItemPayload(entity, {});
    expect(out).not.toHaveProperty("createdAt");
    expect(out).not.toHaveProperty("updatedAt");
  });
});
