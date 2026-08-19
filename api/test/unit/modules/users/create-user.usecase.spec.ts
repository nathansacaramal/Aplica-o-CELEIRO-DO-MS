import sequelize from "@/core/database";
import { CreateUserUseCase } from "@/modules/users/application/use-cases/create-user.usecase";
import { CreateUserRepository } from "@/modules/users/domain/repositories/create-user.repository";
import { FindUserByEmailRepository } from "@/modules/users/domain/repositories/find-user-by-email.repository";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { Encrypter } from "@/core/interfaces";
import { AppError } from "@/core/errors-app-error";
import { DomainLogger } from "@/core/logger/domain-logger"; // ✅ ajuste para o novo caminho (core)

describe("CreateUserUseCase", () => {
  const makeSut = () => {
    const createRepoMock: CreateUserRepository = {
      create: jest.fn(async (user: UserEntity) => {
        return new UserEntity({
          id: 1,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
        });
      }),
    };

    const findByEmailRepoMock: FindUserByEmailRepository = {
      findByEmail: jest.fn(async () => null),
    };

    const encrypterMock: Encrypter = {
      hash: jest.fn(async (value: string) => `hashed-${value}`),
      compare: jest.fn(),
    };

    const loggerMock: DomainLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    // ✅ mock de transaction
    const transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    jest.spyOn(sequelize, "transaction").mockResolvedValue(transactionMock as any);

    // ✅ mock da strategy factory
    const strategyMock = {
      createProfile: jest.fn(async () => undefined),
    };

    const profileStrategyFactoryMock = {
      getStrategy: jest.fn(() => strategyMock),
    };

    // ✅ IMPORTANT: injetar loggerMock e factory mock no construtor
    const sut = new CreateUserUseCase(
      createRepoMock,
      findByEmailRepoMock,
      encrypterMock,
      profileStrategyFactoryMock as any,
      loggerMock,
    );

    return {
      sut,
      createRepoMock,
      findByEmailRepoMock,
      encrypterMock,
      loggerMock,
      transactionMock,
      profileStrategyFactoryMock,
      strategyMock,
    };
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("deve criar um usuário com password criptografada quando email não existe", async () => {
    const {
      sut,
      findByEmailRepoMock,
      encrypterMock,
      createRepoMock,
      loggerMock,
      transactionMock,
      profileStrategyFactoryMock,
      strategyMock,
    } = makeSut();

    const input = {
      name: "Fulano",
      email: "fulano@example.com",
      password: "123456",
      role: "Admin",
    } as any;

    const result = await sut.execute(input);

    expect(findByEmailRepoMock.findByEmail).toHaveBeenCalledWith("fulano@example.com");
    expect(encrypterMock.hash).toHaveBeenCalledWith("123456");

    const [userPassed] = (createRepoMock.create as jest.Mock).mock.calls[0] as [UserEntity];
    expect(userPassed.password).toBe("hashed-123456");

    // ✅ strategy chamada corretamente
    expect(profileStrategyFactoryMock.getStrategy).toHaveBeenCalledWith("Admin");
    expect(strategyMock.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.any(UserEntity),
        payload: input,
      }),
    );

    // ✅ commit chamado no sucesso
    expect(transactionMock.commit).toHaveBeenCalledTimes(1);
    expect(transactionMock.rollback).not.toHaveBeenCalled();

    expect(result.id).toBe(1);
    expect(result.email).toBe("fulano@example.com");

    // ✅ logs corretos (mensagens reais do usecase)
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Iniciando CreateUserUseCase",
      expect.objectContaining({ email: "fulano@example.com", role: "Admin" }),
    );

    expect(loggerMock.info).toHaveBeenCalledWith(
      "Usuário + perfil criados com sucesso",
      expect.objectContaining({ userId: 1, email: "fulano@example.com", role: "Admin" }),
    );
  });

  it("deve lançar AppError EMAIL_ALREADY_IN_USE quando o email já existe", async () => {
    const { sut, findByEmailRepoMock, loggerMock, transactionMock } = makeSut();

    (findByEmailRepoMock.findByEmail as jest.Mock).mockResolvedValueOnce(
      new UserEntity({
        id: 99,
        name: "Outro",
        email: "exists@example.com",
        password: "hash",
        role: "Admin",
      }),
    );

    const input = {
      name: "Fulano",
      email: "exists@example.com",
      password: "123456",
      role: "Admin",
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject<AppError>({
      code: "EMAIL_ALREADY_IN_USE",
      statusCode: 409,
      message: "O e-mail exists@example.com já está em uso",
      name: "AppError",
    });

    // ✅ como o erro acontece antes da transaction, commit/rollback não são chamados
    expect(transactionMock.commit).not.toHaveBeenCalled();
    expect(transactionMock.rollback).not.toHaveBeenCalled();

    // ✅ log esperado: só o "Iniciando..." (não existe "Email já está em uso" no use case)
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Iniciando CreateUserUseCase",
      expect.objectContaining({ email: "exists@example.com", role: "Admin" }),
    );
  });
});
