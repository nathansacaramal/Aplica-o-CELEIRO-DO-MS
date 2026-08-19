import { ListUsersUseCase } from "@/modules/users/application/use-cases/list-users.usecase";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { ListUsersRepository } from "@/modules/users/domain/repositories/list-users.repository";

describe("ListUsersUseCase", () => {
  const baseParams = {
    page: 1,
    limit: 10,
    sortBy: "name" as const,
    sortDir: "asc" as const,
  };

  const makeSut = () => {
    const items = [
      new UserEntity({
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        password: "hash1",
        role: "Admin",
      }),
      new UserEntity({
        id: 2,
        name: "User 2",
        email: "user2@example.com",
        password: "hash2",
        role: "Admin",
      }),
    ];

    const listRepoMock: ListUsersRepository = {
      list: jest.fn(async () => ({
        items,
        total: 2,
        page: 1,
        limit: 10,
      })),
    };

    const sut = new ListUsersUseCase(listRepoMock);

    return { sut, listRepoMock, items };
  };

  it("deve retornar página de usuários e metadados de paginação", async () => {
    const { sut, listRepoMock } = makeSut();

    const result = await sut.execute(baseParams);

    expect(listRepoMock.list).toHaveBeenCalledWith(baseParams);
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.sort).toEqual({ by: "name", dir: "asc" });

    expect(result.items[0]!.email).toBe("user1@example.com");
  });
});
