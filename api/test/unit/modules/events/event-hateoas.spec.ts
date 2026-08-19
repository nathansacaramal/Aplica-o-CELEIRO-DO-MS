import {
  eventLinks,
  eventListLinks,
  eventPublicLinks,
  eventPublicListLinks,
} from "@/modules/events/presentation/http/event-hateoas";

describe("event-hateoas", () => {
  it("eventPublicLinks e eventLinks", () => {
    const pub = eventPublicLinks(5);
    expect(pub["self"]!.href).toContain("/api/public/events/5");
    expect(eventLinks(5).update?.method).toBe("PATCH");
  });

  it("eventListLinks com paginação e filtros", () => {
    const links = eventListLinks({
      page: 2,
      limit: 10,
      totalPages: 5,
      filters: { name: "x", cityId: 1 },
      sort: { by: "name", dir: "desc" },
    });
    expect(links.self!.href).toContain("page=2");
    expect(links.next).toBeDefined();
    expect(links.prev).toBeDefined();
  });

  it("primeira página sem prev; última sem next", () => {
    const first = eventListLinks({ page: 1, limit: 10, totalPages: 3 });
    expect(first.prev).toBeUndefined();
    expect(first.next).toBeDefined();

    const last = eventListLinks({ page: 3, limit: 10, totalPages: 3 });
    expect(last.next).toBeUndefined();
    expect(last.prev).toBeDefined();
  });

  it("eventPublicListLinks usa base pública", () => {
    const links = eventPublicListLinks({
      page: 1,
      limit: 5,
      totalPages: 1,
    });
    expect(links.self!.href).toContain("/api/public/events");
  });
});
