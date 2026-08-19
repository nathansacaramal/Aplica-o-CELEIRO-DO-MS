import { DeleteUserUseCase } from "@/modules/users/application/use-cases/delete-user.usecase";
import { FindUserByIdRepository } from "@/modules/users/domain/repositories/find-user-by-id.repository";
import { DeleteUserRepository } from "@/modules/users/domain/repositories/delete-user.repository";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

describe("DeleteUserUseCase", () => {
  const makeExistingUser = () =>
    new UserEntity({
      id: 1,
      name: "User 1",
      email: "user1@example.com",
      password: "hash",
      role: "Admin",
    });

  const makeSut = () => {
    const findByIdRepoMock: FindUserByIdRepository = {
      findById: jest.fn(async (id: number) => (id === 1 ? makeExistingUser() : null)),
    };

    // ✅ mock da strategy factory
    const strategyMock = {
      removeProfile: jest.fn(async () => undefined),
    };

    const profileStrategyFactoryMock = {
      getStrategy: jest.fn(() => strategyMock),
    };

    const deleteRepoMock: DeleteUserRepository = {
      delete: jest.fn(async (id: number) => id === 1),
    };

    const sut = new DeleteUserUseCase(
      findByIdRepoMock,
      deleteRepoMock,
      profileStrategyFactoryMock as any,
    );

    return { sut, findByIdRepoMock, deleteRepoMock, profileStrategyFactoryMock };
  };

  it("deve retornar false quando usuário não existe e não chamar delete", async () => {
    const { sut, findByIdRepoMock, deleteRepoMock, profileStrategyFactoryMock } = makeSut();

    const result = await sut.execute(999);

    expect(findByIdRepoMock.findById).toHaveBeenCalledWith(999);
    expect(profileStrategyFactoryMock.getStrategy).not.toHaveBeenCalled();
    expect(deleteRepoMock.delete).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("deve deletar usuário existente e retornar true", async () => {
    const { sut, deleteRepoMock, profileStrategyFactoryMock } = makeSut();

    const result = await sut.execute(1);

    expect(profileStrategyFactoryMock.getStrategy).toHaveBeenCalledWith("Admin");
    expect(profileStrategyFactoryMock.getStrategy().removeProfile).toHaveBeenCalledWith(
      1,
      expect.anything(),
    );
    expect(deleteRepoMock.delete).toHaveBeenCalledWith(1, expect.anything());
    expect(result).toBe(true);
  });
});
