import { CreateCityController } from "@/modules/cities/presentation/http/controller/create-city.controller";
import { DeleteCityController } from "@/modules/cities/presentation/http/controller/delete-city.controller";
import { FindCityByIdController } from "@/modules/cities/presentation/http/controller/find-city-by-id.controller";
import { FindCityBySlugController } from "@/modules/cities/presentation/http/controller/find-city-by-slug.controller";
import { ListCityController } from "@/modules/cities/presentation/http/controller/list-city.controller";
import { PublicListCityController } from "@/modules/cities/presentation/http/controller/public-list-city.controller";
import { UpdateCityController } from "@/modules/cities/presentation/http/controller/update-city.controller";
import { AppError } from "@/core/errors-app-error";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const city = new CityEntity({
  id: 1,
  name: "Campo Grande",
  state: "MS",
  slug: "campo-grande",
  summary: "Sum",
  description: "Descrição longa.",
  imageUrl: "https://x.com/c.jpg",
  published: true,
});

describe("CreateCityController", () => {
  const execute = jest.fn();
  const sut = new CreateCityController({ execute } as never);

  it("201 e erro mapeado", async () => {
    execute.mockResolvedValue(city);
    const r = await sut.handle({
      correlationId: "c",
      body: {},
    });
    expect(r.statusCode).toBe(201);
    execute.mockRejectedValue(new Error("x"));
    const r2 = await sut.handle({ correlationId: "c", body: {} });
    expect(r2.statusCode).not.toBe(201);
  });
});

describe("DeleteCityController", () => {
  const execute = jest.fn();
  const sut = new DeleteCityController({ execute } as never);

  it("204 e erro", async () => {
    execute.mockResolvedValue(undefined);
    expect((await sut.handle({ correlationId: "c", params: { id: "1" } })).statusCode).toBe(204);
    execute.mockRejectedValue(new Error("e"));
    expect((await sut.handle({ correlationId: "c", params: { id: "1" } })).statusCode).not.toBe(
      204,
    );
  });
});

describe("FindCityByIdController", () => {
  const execute = jest.fn();
  const admin = new FindCityByIdController({ execute } as never, "admin");
  const pub = new FindCityByIdController({ execute } as never, "public");

  it("404 e 200 admin/público", async () => {
    execute.mockRejectedValue(
      new AppError({
        code: "CIDADE_NOT_FOUND",
        message: "Cidade 1 não encontrada",
        statusCode: 404,
      }),
    );
    expect((await admin.handle({ correlationId: "c", params: { id: "1" } })).statusCode).toBe(404);
    execute.mockResolvedValue(city);
    const a = await admin.handle({ correlationId: "c", params: { id: "1" } });
    expect(a.statusCode).toBe(200);
    const p = await pub.handle({ correlationId: "c", params: { id: "1" } });
    expect(p.statusCode).toBe(200);
  });

  it("público retorna 404 quando cidade não publicada", async () => {
    const draft = new CityEntity({
      id: 2,
      name: "Rascunho",
      state: "MS",
      slug: "rascunho",
      summary: "Sum",
      description: "D",
      imageUrl: "https://x.com/c.jpg",
      published: false,
    });
    execute.mockResolvedValue(draft);
    const r = await pub.handle({ correlationId: "c", params: { id: "2" } });
    expect(r.statusCode).toBe(404);
    expect(r.body).toMatchObject({
      error: { code: "CIDADE_NOT_FOUND" },
      meta: { correlationId: "c" },
    });
  });

  it("erro inesperado", async () => {
    execute.mockRejectedValue(new Error("x"));
    expect((await admin.handle({ correlationId: "c", params: { id: "1" } })).statusCode).not.toBe(
      200,
    );
  });
});

describe("FindCityBySlugController", () => {
  const execute = jest.fn();
  const sut = new FindCityBySlugController({ execute } as never);

  it("404 slug e 200", async () => {
    execute.mockResolvedValue(null);
    expect((await sut.handle({ correlationId: "c", params: { slug: "x" } })).statusCode).toBe(404);
    execute.mockResolvedValue(city);
    expect(
      (await sut.handle({ correlationId: "c", params: { slug: "campo-grande" } })).statusCode,
    ).toBe(200);
  });
});

describe("ListCityController", () => {
  const execute = jest.fn();
  const sut = new ListCityController({ execute } as never);

  it("200 lista", async () => {
    execute.mockResolvedValue([city]);
    expect((await sut.handle({ correlationId: "c" })).statusCode).toBe(200);
  });
});

describe("PublicListCityController", () => {
  const execute = jest.fn();
  const sut = new PublicListCityController({ execute } as never);

  it("200 com null vira lista vazia", async () => {
    execute.mockResolvedValue(null);
    const r = await sut.handle({ correlationId: "c" });
    expect(r.statusCode).toBe(200);
  });
});

describe("UpdateCityController", () => {
  const execute = jest.fn();
  const sut = new UpdateCityController({ execute } as never);

  it("404 sem cidade e 200", async () => {
    execute.mockResolvedValue(null);
    expect(
      (await sut.handle({ correlationId: "c", params: { id: "1" }, body: {} })).statusCode,
    ).toBe(404);
    execute.mockResolvedValue(city);
    expect(
      (await sut.handle({ correlationId: "c", params: { id: "1" }, body: { name: "N" } }))
        .statusCode,
    ).toBe(200);
  });
});
