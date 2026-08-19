import { buildPaginationLinks } from "@/core/http/hateoas/pagination-links";

describe("buildPaginationLinks", () => {
  it("deve gerar self e preservar filtros/sort na query", () => {
    const links = buildPaginationLinks({
      basePath: "/api/tourist-points",
      page: 2,
      limit: 10,
      totalPages: 5,
      query: {
        nome: "praça",
        city: "Dourados",
        sortBy: "createdAt",
        sortDir: "DESC",
      },
    });

    expect(links.self).toEqual({
      href: expect.stringContaining("/api/tourist-points?"),
      method: "GET",
    });

    // self deve conter todos os params + page/limit
    expect(links.self?.href).toContain("nome=pra%C3%A7a");
    expect(links.self?.href).toContain("city=Dourados");
    expect(links.self?.href).toContain("sortBy=createdAt");
    expect(links.self?.href).toContain("sortDir=DESC");
    expect(links.self?.href).toContain("page=2");
    expect(links.self?.href).toContain("limit=10");
  });

  it("deve incluir prev/next/first/last quando aplicável (includeFirstLast default true)", () => {
    const links = buildPaginationLinks({
      basePath: "/api/tourist-points",
      page: 2,
      limit: 10,
      totalPages: 3,
      query: { city: "Dourados" },
    });

    expect(links.prev).toEqual({
      href: expect.stringContaining("page=1"),
      method: "GET",
    });
    expect(links.next).toEqual({
      href: expect.stringContaining("page=3"),
      method: "GET",
    });
    expect(links.first).toEqual({
      href: expect.stringContaining("page=1"),
      method: "GET",
    });
    expect(links.last).toEqual({
      href: expect.stringContaining("page=3"),
      method: "GET",
    });

    // mantém limit e filtros
    expect(links.next?.href).toContain("limit=10");
    expect(links.next?.href).toContain("city=Dourados");
  });

  it("não deve incluir prev/first quando page=1", () => {
    const links = buildPaginationLinks({
      basePath: "/api/tourist-points",
      page: 1,
      limit: 10,
      totalPages: 3,
    });

    expect(links.prev).toBeUndefined();
    expect(links.first).toBeUndefined();
    expect(links.next).toBeDefined();
    expect(links.last).toBeDefined();
  });

  it("não deve incluir next/last quando page=totalPages", () => {
    const links = buildPaginationLinks({
      basePath: "/api/tourist-points",
      page: 3,
      limit: 10,
      totalPages: 3,
    });

    expect(links.next).toBeUndefined();
    expect(links.last).toBeUndefined();
    expect(links.prev).toBeDefined();
    expect(links.first).toBeDefined();
  });

  it("deve respeitar includeFirstLast=false", () => {
    const links = buildPaginationLinks({
      basePath: "/api/tourist-points",
      page: 2,
      limit: 10,
      totalPages: 3,
      includeFirstLast: false,
    });

    expect(links.first).toBeUndefined();
    expect(links.last).toBeUndefined();
    expect(links.prev).toBeDefined();
    expect(links.next).toBeDefined();
  });

  it("deve remover query params vazios/undefined/null", () => {
    const links = buildPaginationLinks({
      basePath: "/api/tourist-points",
      page: 1,
      limit: 10,
      totalPages: 1,
      query: {
        nome: "",
        city: undefined,
        estado: null,
        sortBy: "nome",
      } as any,
    });

    // só deve sobrar sortBy + page/limit
    expect(links.self?.href).toContain("sortBy=nome");
    expect(links.self?.href).toContain("page=1");
    expect(links.self?.href).toContain("limit=10");

    expect(links.self?.href).not.toContain("nome=");
    expect(links.self?.href).not.toContain("city=");
    expect(links.self?.href).not.toContain("estado=");
  });
});
