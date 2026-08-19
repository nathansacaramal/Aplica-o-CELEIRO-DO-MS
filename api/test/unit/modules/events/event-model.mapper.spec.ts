import { eventModelToEntity } from "@/modules/events/infra/mappers/event-model.mapper";
import EventModel from "@/modules/events/infra/model/event-model";

describe("eventModelToEntity", () => {
  it("mapeia categoria válida", () => {
    const m = {
      id: 1,
      cityId: 2,
      citySlug: "cg",
      name: "E",
      description: "D",
      category: "show",
      startDate: new Date(),
      endDate: new Date(),
      formattedDate: "2025-01-01",
      location: "L",
      imageUrl: "https://x.com/i.jpg",
      featured: true,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as EventModel;
    const e = eventModelToEntity(m);
    expect(e.category).toBe("show");
    expect(e.id).toBe(1);
  });

  it("fallback de categoria quando inválida no banco", () => {
    const m = {
      id: 1,
      cityId: 2,
      citySlug: "cg",
      name: "E",
      description: "D",
      category: "???",
      startDate: new Date(),
      endDate: new Date(),
      formattedDate: "x",
      location: "L",
      imageUrl: "https://x.com/i.jpg",
      featured: false,
      published: true,
    } as unknown as EventModel;
    const e = eventModelToEntity(m);
    expect(e.category).toBe("show");
  });
});
