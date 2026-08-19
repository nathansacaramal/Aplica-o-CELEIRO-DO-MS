import { CreateInstitutionalContentController } from "@/modules/institutional-content/presentation/http/controllers/create-institutional-content.controller";
import { DeleteInstitutionalContentController } from "@/modules/institutional-content/presentation/http/controllers/delete-institutional-content.controller";
import { FindInstitutionalContentByIdController } from "@/modules/institutional-content/presentation/http/controllers/find-institutional-content-by-id.controller";
import { GetInstitutionalContentController } from "@/modules/institutional-content/presentation/http/controllers/get-institutional-content.controller";
import { UpdateInstitutionalContentController } from "@/modules/institutional-content/presentation/http/controllers/update-institutional-content.controller";
import { InstitutionalContentEntity } from "@/modules/institutional-content/domain/entities/institutional-content.entity";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const instBody = {
  aboutTitle: "Sobre",
  aboutText: "Texto",
  whoWeAreTitle: "Quem",
  whoWeAreText: "Somos",
  purposeTitle: "Prop",
  purposeText: "Propósito",
  mission: "M",
  vision: "V",
  valuesJson: "[]",
};

const makeEntity = (id: number) =>
  new InstitutionalContentEntity({
    id,
    ...instBody,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const persisted = { id: 1, ...instBody, createdAt: new Date(), updatedAt: new Date() };

describe("CreateInstitutionalContentController", () => {
  const execute = jest.fn();
  const sut = new CreateInstitutionalContentController({ execute } as never);

  it("201 e erro", async () => {
    execute.mockResolvedValue(persisted);
    expect((await sut.handle({ correlationId: "c", body: instBody })).statusCode).toBe(201);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", body: instBody })).statusCode).not.toBe(201);
  });
});

describe("GetInstitutionalContentController", () => {
  const execute = jest.fn();

  it("200 admin e público; erro", async () => {
    const list = [makeEntity(1)];
    execute.mockResolvedValue(list);
    const sutAdmin = new GetInstitutionalContentController({ execute } as never, "admin");
    const sutPublic = new GetInstitutionalContentController({ execute } as never, "public");
    expect((await sutAdmin.handle({ correlationId: "c" })).statusCode).toBe(200);
    expect((await sutPublic.handle({ correlationId: "c" })).statusCode).toBe(200);
    execute.mockRejectedValue(new Error("x"));
    expect((await sutAdmin.handle({ correlationId: "c" })).statusCode).not.toBe(200);
  });
});

describe("FindInstitutionalContentByIdController", () => {
  const execute = jest.fn();

  it("200 admin e público, 404 e erro", async () => {
    const ent = makeEntity(2);
    execute.mockResolvedValue(ent);
    const sutAdmin = new FindInstitutionalContentByIdController({ execute } as never, "admin");
    const sutPublic = new FindInstitutionalContentByIdController({ execute } as never, "public");
    expect(
      (await sutAdmin.handle({ correlationId: "c", pathParams: { id: "2" } })).statusCode,
    ).toBe(200);
    expect(
      (await sutPublic.handle({ correlationId: "c", pathParams: { id: "2" } })).statusCode,
    ).toBe(200);
    execute.mockResolvedValue(null);
    expect(
      (await sutAdmin.handle({ correlationId: "c", pathParams: { id: "2" } })).statusCode,
    ).toBe(404);
    execute.mockRejectedValue(new Error("x"));
    expect(
      (await sutAdmin.handle({ correlationId: "c", pathParams: { id: "2" } })).statusCode,
    ).not.toBe(200);
  });
});

describe("UpdateInstitutionalContentController", () => {
  const execute = jest.fn();
  const sut = new UpdateInstitutionalContentController({ execute } as never);

  it("200, 404 e erro", async () => {
    execute.mockResolvedValue(persisted);
    expect(
      (
        await sut.handle({
          correlationId: "c",
          pathParams: { id: "1" },
          body: { mission: "X" },
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

describe("DeleteInstitutionalContentController", () => {
  const execute = jest.fn();
  const sut = new DeleteInstitutionalContentController({ execute } as never);

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
