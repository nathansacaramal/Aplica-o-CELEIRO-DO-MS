import { RefreshTokenController } from "@/modules/auth/presentation/http/controllers/refresh-token.controller";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/refresh-token.usecase";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

describe("RefreshTokenController", () => {
  const execute = jest.fn();
  const sut = new RefreshTokenController({ execute } as unknown as RefreshTokenUseCase);

  beforeEach(() => jest.clearAllMocks());

  it("200 retorna accessToken", async () => {
    execute.mockResolvedValue({ accessToken: "new-access" });
    const r = await sut.handle({
      body: { refreshToken: "rt" },
      correlationId: "cid",
    });
    expect(r.statusCode).toBe(200);
    expect((r.body as { data: { accessToken: string } }).data.accessToken).toBe("new-access");
  });

  it("erro do use case vira resposta HTTP mapeada", async () => {
    execute.mockRejectedValue(new Error("fail"));
    const r = await sut.handle({
      body: { refreshToken: "rt" },
      correlationId: "cid",
    });
    expect(r.statusCode).not.toBe(200);
  });
});
