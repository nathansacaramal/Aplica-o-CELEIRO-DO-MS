import { api } from "../helpers/api";
import { closeDb, resetDb, syncDb } from "../helpers/db";
import { CityModel } from "@/modules/cities/infra/models/city-model";

describe("GET /api/public/cities (integration)", () => {
  beforeAll(async () => {
    await syncDb();
  });

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("retorna envelope data/links/meta apenas com cidades publicadas", async () => {
    await CityModel.bulkCreate([
      {
        name: "B Publicada",
        slug: "b-publicada",
        state: "MS",
        summary: "Resumo B",
        description: "Desc",
        imageUrl: "https://cdn.example/b.jpg",
        published: true,
      },
      {
        name: "A Publicada",
        slug: "a-publicada",
        state: "MS",
        summary: "Resumo A",
        description: "Desc",
        imageUrl: "https://cdn.example/a.jpg",
        published: true,
      },
      {
        name: "Rascunho",
        slug: "rascunho",
        state: "MS",
        summary: "R",
        description: null,
        imageUrl: "https://cdn.example/r.jpg",
        published: false,
      },
    ]);

    const resp = await api().get("/api/public/cities");

    expect(resp.status).toBe(200);
    expect(resp.body.data).toHaveLength(2);
    expect(resp.body.data.map((c: { slug: string }) => c.slug)).toEqual([
      "a-publicada",
      "b-publicada",
    ]);
    expect(resp.body.links).toMatchObject({
      self: expect.objectContaining({ method: "GET" }),
    });
    expect(resp.body.meta).toMatchObject({
      correlationId: expect.any(String),
      version: "1.0.0",
    });
  });
});
