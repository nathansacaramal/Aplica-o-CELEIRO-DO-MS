import { CreateHomeHighlightController } from "@/modules/home-highlights/presentation/http/controllers/create-home-highlight.controller";
import { DeleteHomeHighlightController } from "@/modules/home-highlights/presentation/http/controllers/delete-home-highlight.controller";
import { FindHomeHighlightByIdController } from "@/modules/home-highlights/presentation/http/controllers/find-home-highlight-by-id.controller";
import { GetHomeHighlightController } from "@/modules/home-highlights/presentation/http/controllers/get-home-highlight.controller";
import { UpdateHomeHighlightController } from "@/modules/home-highlights/presentation/http/controllers/update-home-highlight.controller";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const row = {
  id: 1,
  type: "custom" as const,
  referenceId: 0,
  title: "Destaque",
  description: "D",
  cityName: "CG",
  imageUrl: "https://x.png",
  ctaUrl: "https://x",
  active: true,
  order: 0,
};

describe("CreateHomeHighlightController", () => {
  const execute = jest.fn();
  const sut = new CreateHomeHighlightController({ execute } as never);

  it("201, falha quando use case retorna null e erro", async () => {
    execute.mockResolvedValue(row);
    expect((await sut.handle({ correlationId: "c", body: {} })).statusCode).toBe(201);
    execute.mockResolvedValue(null);
    expect((await sut.handle({ correlationId: "c", body: {} })).statusCode).not.toBe(201);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", body: {} })).statusCode).not.toBe(201);
  });
});

describe("GetHomeHighlightController", () => {
  const execute = jest.fn();
  const sut = new GetHomeHighlightController({ execute } as never);

  it("200 e erro", async () => {
    execute.mockResolvedValue([row]);
    expect((await sut.handle({ correlationId: "c" })).statusCode).toBe(200);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c" })).statusCode).not.toBe(200);
  });
});

describe("FindHomeHighlightByIdController", () => {
  const execute = jest.fn();
  const sut = new FindHomeHighlightByIdController({ execute } as never);

  it("200, 404 e erro", async () => {
    execute.mockResolvedValue(row);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "1" } })).statusCode).toBe(
      200,
    );
    execute.mockResolvedValue(null);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "1" } })).statusCode).toBe(
      404,
    );
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "1" } })).statusCode).not.toBe(
      200,
    );
  });
});

describe("UpdateHomeHighlightController", () => {
  const execute = jest.fn();
  const sut = new UpdateHomeHighlightController({ execute } as never);

  it("200, 404 e erro", async () => {
    execute.mockResolvedValue(row);
    expect(
      (
        await sut.handle({
          correlationId: "c",
          pathParams: { id: "1" },
          body: { title: "N" },
        })
      ).statusCode,
    ).toBe(200);
    execute.mockResolvedValue(null);
    expect(
      (
        await sut.handle({
          correlationId: "c",
          pathParams: { id: "1" },
          body: {},
        })
      ).statusCode,
    ).toBe(404);
    execute.mockRejectedValue(new Error("x"));
    expect(
      (
        await sut.handle({
          correlationId: "c",
          pathParams: { id: "1" },
          body: {},
        })
      ).statusCode,
    ).not.toBe(200);
  });
});

describe("DeleteHomeHighlightController", () => {
  const execute = jest.fn();
  const sut = new DeleteHomeHighlightController({ execute } as never);

  it("200, 404 e erro", async () => {
    execute.mockResolvedValue(true);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "1" } })).statusCode).toBe(
      200,
    );
    execute.mockResolvedValue(false);
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "1" } })).statusCode).toBe(
      404,
    );
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", pathParams: { id: "1" } })).statusCode).not.toBe(
      200,
    );
  });
});
