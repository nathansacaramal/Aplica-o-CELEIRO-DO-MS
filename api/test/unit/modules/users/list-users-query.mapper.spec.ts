import { toListUsersSearchParams } from "@/modules/users/presentation/http/mappers/list-users-query.mapper";
import type { ListUsersQueryDTO } from "@/modules/users/application/dto";

describe("toListUsersSearchParams", () => {
  it("aplica defaults de ordenação e repassa page/limit", () => {
    const q = {
      page: 2,
      limit: 20,
      sortDir: "desc" as const,
    } as ListUsersQueryDTO;

    expect(toListUsersSearchParams(q)).toEqual({
      page: 2,
      limit: 20,
      sortBy: "name",
      sortDir: "desc",
    });
  });

  it("inclui nameContains e emailEquals quando definidos", () => {
    const q = {
      page: 1,
      limit: 10,
      name: "Ana",
      email: "a@b.com",
      sortBy: "email" as const,
      sortDir: "asc" as const,
    } as ListUsersQueryDTO;

    expect(toListUsersSearchParams(q)).toEqual({
      page: 1,
      limit: 10,
      nameContains: "Ana",
      emailEquals: "a@b.com",
      sortBy: "email",
      sortDir: "asc",
    });
  });

  it("não inclui chaves de filtro quando name/email ausentes", () => {
    const q = {
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDir: "asc" as const,
    } as ListUsersQueryDTO;

    const out = toListUsersSearchParams(q);
    expect(out).not.toHaveProperty("nameContains");
    expect(out).not.toHaveProperty("emailEquals");
  });
});
