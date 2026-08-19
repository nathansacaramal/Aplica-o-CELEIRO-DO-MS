import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/refresh-token.usecase";
import { AuthTokenService } from "@/modules/auth/domain/services/auth-token.service";
import { FindUserByIdRepository } from "@/modules/users/domain/repositories/find-user-by-id.repository";
import { DomainLogger } from "@/core/logger/domain-logger";

describe("RefreshTokenUseCase", () => {
  const makeSut = () => {
    const tokenServiceMock: AuthTokenService = {
      generateAccessToken: jest.fn(() => "new-access-token"),
      generateRefreshToken: jest.fn(),
      decodeRefreshToken: jest.fn(() => ({ sub: "1" }) as any),
    };

    const findUserByIdRepoMock: FindUserByIdRepository = {
      findById: jest.fn(
        async () =>
          ({
            id: 1,
            name: "Fulano",
            email: "fulano@example.com",
            password: "hash",
            role: "Admin",
          }) as any,
      ),
    };

    const loggerMock: DomainLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const sut = new RefreshTokenUseCase(tokenServiceMock, findUserByIdRepoMock, loggerMock);

    return { sut, tokenServiceMock, findUserByIdRepoMock, loggerMock };
  };

  it("deve gerar novo access token com sucesso", async () => {
    const { sut, tokenServiceMock, findUserByIdRepoMock } = makeSut();

    const out = await sut.execute("valid-refresh-token");

    expect(tokenServiceMock.decodeRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
    expect(findUserByIdRepoMock.findById).toHaveBeenCalledWith(1);
    expect(tokenServiceMock.generateAccessToken).toHaveBeenCalledWith({
      sub: "1",
      email: "fulano@example.com",
      role: "Admin",
    });

    expect(out).toEqual({ accessToken: "new-access-token" });
  });
});
