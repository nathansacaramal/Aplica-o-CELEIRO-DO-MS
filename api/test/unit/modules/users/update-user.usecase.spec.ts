import { UpdateUserUseCase } from "@/modules/users/application/use-cases/update-user.usecase";
import { FindUserByIdRepository } from "@/modules/users/domain/repositories/find-user-by-id.repository";
import { UpdateUserRepository } from "@/modules/users/domain/repositories/update-user.repository";
import { UserEntity, UserProps } from "@/modules/users/domain/entities/user.entity";
import { Encrypter } from "@/core/interfaces";

describe("UpdateUserUseCase", () => {
  const makeExistingUser = () =>
    new UserEntity({
      id: 1,
      name: "User 1",
      email: "user1@example.com",
      password: "old-hash",
      role: "Admin",
    });

  const makeSut = () => {
    const existingUser = makeExistingUser();

    const findByIdRepoMock: FindUserByIdRepository = {
      findById: jest.fn(async (id: number) => (id === 1 ? existingUser : null)),
    };

    const updateRepoMock: UpdateUserRepository = {
      update: jest.fn(
        async (id: number, data: Partial<UserProps>) =>
          new UserEntity({
            id,
            name: data.name ?? existingUser.name,
            email: data.email ?? existingUser.email,
            password: data.password ?? existingUser.password,
            role: data.role ?? existingUser.role,
          }),
      ),
    };

    const encrypterMock: Encrypter = {
      hash: jest.fn(async (value: string) => `hashed-${value}`),
      compare: jest.fn(),
    };

    const sut = new UpdateUserUseCase(findByIdRepoMock, updateRepoMock, encrypterMock);

    return {
      sut,
      findByIdRepoMock,
      updateRepoMock,
      encrypterMock,
      existingUser,
    };
  };

  it("deve retornar null quando usuário não existe", async () => {
    const { sut, findByIdRepoMock } = makeSut();

    const result = await sut.execute(999, {} as any);

    expect(findByIdRepoMock.findById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it("deve atualizar campos básicos sem alterar password quando password não é enviada", async () => {
    const { sut, updateRepoMock } = makeSut();

    const input = {
      name: "User 1 Atualizado",
      email: "novo-email@example.com",
      role: "Admin",
    } as any;

    const result = await sut.execute(1, input);

    const [, data] = (await (updateRepoMock.update as jest.Mock).mock.calls[0]) as [
      number,
      Partial<UserProps>,
    ];

    expect(data.name).toBe("User 1 Atualizado");
    expect(data.email).toBe("novo-email@example.com");
    expect(data.role).toBe("Admin");
    expect(data.password).toBeUndefined();

    expect(result?.name).toBe("User 1 Atualizado");
    expect(result?.email).toBe("novo-email@example.com");
    expect(result?.role).toBe("Admin");
  });

  it("deve criptografar nova password quando enviada", async () => {
    const { sut, encrypterMock, updateRepoMock } = makeSut();

    const input = {
      password: "nova-password",
    } as any;

    const result = await sut.execute(1, input);

    expect(encrypterMock.hash).toHaveBeenCalledWith("nova-password");

    const [, data] = (updateRepoMock.update as jest.Mock).mock.calls[0] as [
      number,
      Partial<UserProps>,
    ];

    expect(data.password).toBe("hashed-nova-password");
    expect(result?.password).toBe("hashed-nova-password");
  });
});
