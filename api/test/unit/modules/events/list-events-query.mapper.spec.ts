import { toListEventsUseCaseInput } from "@/modules/events/presentation/http/mappers/list-events-query.mapper";
import type { ListEventsQueryDTO } from "@/modules/events/presentation/http/validators/event-schemas";

describe("toListEventsUseCaseInput", () => {
  const base = {
    page: 1,
    limit: 10,
    sortDir: "asc" as const,
  };

  it("preserva campos e aceita categoria válida", () => {
    const q = {
      ...base,
      name: "Fest",
      category: "show",
      cityId: 5,
      sortBy: "name",
    } as ListEventsQueryDTO;

    expect(toListEventsUseCaseInput(q)).toEqual({
      page: 1,
      limit: 10,
      name: "Fest",
      category: "show",
      cityId: 5,
      sortBy: "name",
      sortDir: "asc",
    });
  });

  it("descarta categoria inválida", () => {
    const q = {
      ...base,
      category: "nao_existe",
    } as ListEventsQueryDTO;

    expect(toListEventsUseCaseInput(q).category).toBeUndefined();
  });

  it("category undefined permanece undefined", () => {
    const q = { ...base } as ListEventsQueryDTO;
    expect(toListEventsUseCaseInput(q).category).toBeUndefined();
  });
});
