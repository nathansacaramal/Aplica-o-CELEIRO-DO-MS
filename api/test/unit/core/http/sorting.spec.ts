import { normalizeSort } from "@/core/http/sorting";

const allowed = ["name", "id"] as const;

describe("normalizeSort", () => {
  it("usa defaults quando sortBy inválido", () => {
    expect(
      normalizeSort({ sortBy: "invalid" as "name", sortDir: "ASC" }, allowed, {
        sortBy: "name",
        sortDir: "ASC",
      }),
    ).toEqual({ sortBy: "name", sortDir: "ASC" });
  });

  it("aceita sortBy permitido e normaliza direção", () => {
    expect(
      normalizeSort({ sortBy: "id", sortDir: "desc" }, allowed, {
        sortBy: "name",
        sortDir: "ASC",
      }),
    ).toEqual({ sortBy: "id", sortDir: "DESC" });
  });

  it("normaliza DESC", () => {
    expect(
      normalizeSort({ sortBy: "name", sortDir: "DESC" }, allowed, {
        sortBy: "name",
        sortDir: "ASC",
      }),
    ).toEqual({ sortBy: "name", sortDir: "DESC" });
  });
});
