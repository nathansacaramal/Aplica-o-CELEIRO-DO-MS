import { EventEntity } from "@/modules/events/domain/entities/event.entity";
import { toEventHttpPayload } from "@/modules/events/presentation/http/mappers/event-response.mapper";

describe("toEventHttpPayload", () => {
  const props = {
    id: 1,
    cityId: 2,
    citySlug: "cg",
    name: "Show",
    description: "D",
    category: "show" as const,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-02"),
    formattedDate: "Jan",
    location: "Centro",
    imageUrl: "https://x.com/i.jpg",
    featured: true,
    published: true,
    createdAt: new Date("2025-01-03"),
    updatedAt: new Date("2025-01-04"),
  };

  it("aceita EventEntity (instanceof)", () => {
    const entity = new EventEntity(props);
    const out = toEventHttpPayload(entity);
    expect(out.id).toBe(1);
    expect(out.name).toBe("Show");
    expect(out.category).toBe("show");
    expect(out.createdAt).toEqual(props.createdAt);
  });

  it("aceita objeto EventProps plain", () => {
    const out = toEventHttpPayload(props);
    expect(out).toMatchObject({
      id: 1,
      citySlug: "cg",
      featured: true,
    });
  });
});
