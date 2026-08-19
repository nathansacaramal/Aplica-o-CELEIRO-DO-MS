import { AppError } from "@/core/errors-app-error";
import { GetUserByIdController } from "@/modules/users/presentation/http/controllers/get-user-by-id.controller";
import { GetUserByIdUseCase } from "@/modules/users/application/use-cases/get-user-by-id.usecase";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

describe("GetUserByIdController", () => {
  const makeSut = () => {
    const useCase: Pick<GetUserByIdUseCase, "execute"> = {
      execute: jest.fn(),
    };
    const sut = new GetUserByIdController(useCase as GetUserByIdUseCase);
    return { sut, useCase };
  };

  it("retorna 400 quando id não é número", async () => {
    const { sut } = makeSut();
    const res = await sut.handle({
      params: { id: "abc" },
      correlationId: "c1",
    });
    expect(res.statusCode).toBe(400);
    const body = res.body as { error: { code: string } };
    expect(body.error.code).toBe("INVALID_ID");
  });

  it("retorna 404 quando usuário não existe", async () => {
    const { sut, useCase } = makeSut();
    (useCase.execute as jest.Mock).mockRejectedValue(
      new AppError({
        code: "USER_NOT_FOUND",
        message: "Usuário não encontrado",
        statusCode: 404,
      }),
    );

    const res = await sut.handle({
      params: { id: "7" },
      correlationId: "c2",
    });

    expect(useCase.execute).toHaveBeenCalledWith(7);
    expect(res.statusCode).toBe(404);
  });

  it("retorna 200 com dados quando encontrado (sem senha no payload)", async () => {
    const { sut, useCase } = makeSut();
    const user = new UserEntity({
      id: 2,
      name: "Admin",
      email: "a@b.com",
      password: "hash",
      role: "Admin",
    });
    (useCase.execute as jest.Mock).mockResolvedValue(user);

    const res = await sut.handle({
      params: { id: "2" },
      correlationId: "c3",
    });

    expect(res.statusCode).toBe(200);
    const body = res.body as { data: { email: string; password?: string } };
    expect(body.data.email).toBe("a@b.com");
    expect(body.data.password).toBeUndefined();
  });
});
