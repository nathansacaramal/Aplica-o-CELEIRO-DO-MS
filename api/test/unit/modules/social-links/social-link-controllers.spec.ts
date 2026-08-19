import { CreateSocialLinkController } from "@/modules/social-links/presentation/http/controllers/create-social-link.controller";
import { DeleteSocialLinkController } from "@/modules/social-links/presentation/http/controllers/delete-social-link.controller";
import { FindSocialLinkByIdController } from "@/modules/social-links/presentation/http/controllers/find-social-link-by-id.controller";
import { GetSocialLinkController } from "@/modules/social-links/presentation/http/controllers/get-social-link.controller";
import { UpdateSocialLinkController } from "@/modules/social-links/presentation/http/controllers/update-social-link.controller";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const entity = new SocialLinkEntity({
  id: 3,
  platform: "instagram",
  label: "IG",
  url: "https://instagram.com/x",
  active: true,
  order: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createBody = {
  platform: "instagram",
  label: "IG",
  url: "https://instagram.com/x",
  active: true,
  order: 2,
};

describe("GetSocialLinkController", () => {
  const execute = jest.fn();
  const sutAdmin = new GetSocialLinkController({ execute } as never, "admin");
  const sutPublic = new GetSocialLinkController({ execute } as never, "public");

  it("200 com lista (admin e público) e ramo de erro", async () => {
    execute.mockResolvedValue([entity]);
    expect((await sutAdmin.handle({ correlationId: "c" })).statusCode).toBe(200);
    expect((await sutPublic.handle({ correlationId: "c" })).statusCode).toBe(200);
    execute.mockRejectedValue(new Error("db"));
    expect((await sutAdmin.handle({ correlationId: "c" })).statusCode).not.toBe(200);
  });
});

describe("FindSocialLinkByIdController", () => {
  const execute = jest.fn();
  const sut = new FindSocialLinkByIdController({ execute } as never, "admin");
  const sutPublic = new FindSocialLinkByIdController({ execute } as never, "public");

  it("200, 404 e erro (admin); público usa links públicos", async () => {
    execute.mockResolvedValue(entity);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "3" } })).statusCode).toBe(
      200,
    );
    expect(
      (await sutPublic.handle({ correlationId: "c", pathParams: { id: "3" } })).statusCode,
    ).toBe(200);
    execute.mockResolvedValue(null);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "3" } })).statusCode).toBe(
      404,
    );
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "3" } })).statusCode).not.toBe(
      200,
    );
  });
});

describe("DeleteSocialLinkController", () => {
  const execute = jest.fn();
  const sut = new DeleteSocialLinkController({ execute } as never);

  it("200 quando deletado, 404 quando use case retorna false, erro propagado", async () => {
    execute.mockResolvedValue(true);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "3" } })).statusCode).toBe(
      200,
    );
    execute.mockResolvedValue(false);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "3" } })).statusCode).toBe(
      404,
    );
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "3" } })).statusCode).not.toBe(
      200,
    );
  });
});

describe("CreateSocialLinkController", () => {
  const execute = jest.fn();
  const sut = new CreateSocialLinkController({ execute } as never);

  it("201, falha mapeada quando null e erro do use case", async () => {
    execute.mockResolvedValue(entity);
    expect((await sut.handle({ correlationId: "c", body: createBody })).statusCode).toBe(201);
    execute.mockResolvedValue(null);
    expect((await sut.handle({ correlationId: "c", body: createBody })).statusCode).not.toBe(201);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", body: createBody })).statusCode).not.toBe(201);
  });
});

describe("UpdateSocialLinkController", () => {
  const execute = jest.fn();
  const sut = new UpdateSocialLinkController({ execute } as never);

  it("200, 404 e erro", async () => {
    execute.mockResolvedValue(entity);
    expect(
      (
        await sut.handle({
          correlationId: "c",
          pathParams: { id: "3" },
          body: { label: "Novo" },
        })
      ).statusCode,
    ).toBe(200);
    execute.mockResolvedValue(null);
    expect(
      (
        await sut.handle({
          correlationId: "c",
          pathParams: { id: "3" },
          body: {},
        })
      ).statusCode,
    ).toBe(404);
    execute.mockRejectedValue(new Error("x"));
    expect(
      (
        await sut.handle({
          correlationId: "c",
          pathParams: { id: "3" },
          body: {},
        })
      ).statusCode,
    ).not.toBe(200);
  });
});
