import { normalizePagination } from "@/core/http/pagination";

describe("normalizePagination", () => {
  it("usa defaults page=1 limit=10", () => {
    expect(normalizePagination({})).toEqual({
      page: 1,
      limit: 10,
      offset: 0,
    });
  });

  it("respeita maxLimit", () => {
    expect(normalizePagination({ page: 1, limit: 999 }, { maxLimit: 20 })).toEqual({
      page: 1,
      limit: 20,
      offset: 0,
    });
  });

  it("page mínimo 1 e offset correto", () => {
    expect(normalizePagination({ page: 0, limit: 5 })).toEqual({
      page: 1,
      limit: 5,
      offset: 0,
    });
    expect(normalizePagination({ page: 3, limit: 10 })).toEqual({
      page: 3,
      limit: 10,
      offset: 20,
    });
  });

  it("limit mínimo 1", () => {
    expect(normalizePagination({ limit: 0 })).toEqual({
      page: 1,
      limit: 1,
      offset: 0,
    });
  });
});
