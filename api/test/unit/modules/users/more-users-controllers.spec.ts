import { DeleteUserController } from "@/modules/users/presentation/http/controllers/delete-user.controller";
import { ListUsersController } from "@/modules/users/presentation/http/controllers/list-users.controller";
import { UpdateUserController } from "@/modules/users/presentation/http/controllers/update-user.controller";
import { DeleteUserUseCase } from "@/modules/users/application/use-cases/delete-user.usecase";
import { ListUsersUseCase } from "@/modules/users/application/use-cases/list-users.usecase";
import { UpdateUserUseCase } from "@/modules/users/application/use-cases/update-user.usecase";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { listUsersQuerySchema } from "@/modules/users/presentation/http/validators/user-schemas";

describe("DeleteUserController", () => {
  const uc: Pick<DeleteUserUseCase, "execute"> = { execute: jest.fn() };
  const sut = new DeleteUserController(uc as DeleteUserUseCase);

  it("400 id inválido", async () => {
    const r = await sut.handle({ params: { id: "x" }, correlationId: "c" });
    expect(r.statusCode).toBe(400);
  });

  it("404 não deletado", async () => {
    (uc.execute as jest.Mock).mockResolvedValue(false);
    const r = await sut.handle({ params: { id: "1" }, correlationId: "c" });
    expect(r.statusCode).toBe(404);
  });

  it("204 sucesso", async () => {
    (uc.execute as jest.Mock).mockResolvedValue(true);
    const r = await sut.handle({ params: { id: "1" }, correlationId: "c" });
    expect(r.statusCode).toBe(204);
  });
});

describe("ListUsersController", () => {
  const uc: Pick<ListUsersUseCase, "execute"> = { execute: jest.fn() };
  const sut = new ListUsersController(uc as ListUsersUseCase);

  it("200 lista", async () => {
    (uc.execute as jest.Mock).mockResolvedValue({
      items: [
        new UserEntity({
          id: 1,
          name: "A",
          email: "a@b.com",
          password: "p",
          role: "Admin",
        }),
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      sort: { by: "name" as const, dir: "asc" as const },
    });
    const r = await sut.handle({
      correlationId: "c",
      validatedQuery: listUsersQuerySchema.parse({}),
    });
    expect(r.statusCode).toBe(200);
    expect((r.body as { data: unknown[] }).data).toHaveLength(1);
  });
});

describe("UpdateUserController", () => {
  const uc: Pick<UpdateUserUseCase, "execute"> = { execute: jest.fn() };
  const sut = new UpdateUserController(uc as UpdateUserUseCase);

  it("400 id inválido", async () => {
    const r = await sut.handle({
      params: { id: "bad" },
      body: {},
      correlationId: "c",
    });
    expect(r.statusCode).toBe(400);
  });

  it("404 usuário não encontrado", async () => {
    (uc.execute as jest.Mock).mockResolvedValue(null);
    const r = await sut.handle({
      params: { id: "2" },
      body: { name: "X" },
      correlationId: "c",
    });
    expect(r.statusCode).toBe(404);
  });

  it("200 atualizado", async () => {
    const u = new UserEntity({
      id: 2,
      name: "N",
      email: "n@b.com",
      password: "p",
      role: "Admin",
    });
    (uc.execute as jest.Mock).mockResolvedValue(u);
    const r = await sut.handle({
      params: { id: "2" },
      body: { name: "N" },
      correlationId: "c",
    });
    expect(r.statusCode).toBe(200);
  });
});
