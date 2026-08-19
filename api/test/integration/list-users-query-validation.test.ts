import { api } from "../helpers/api";
import { seedUserAndLogin } from "../helpers/auth";
import { closeDb, resetDb, syncDb } from "../helpers/db";

describe("GET /api/admin/users — validateQuery (integração)", () => {
  let token: string;

  beforeAll(async () => {
    await syncDb();
  });

  beforeEach(async () => {
    await resetDb();
    const auth = await seedUserAndLogin();
    token = auth.token;
  });

  afterAll(async () => {
    await closeDb();
  });

  it("retorna 400 quando query contém parâmetro não permitido (.strict)", async () => {
    const resp = await api().withAuth(api().get("/api/admin/users?unknownParam=1"), token);

    expect(resp.status).toBe(400);
    expect(resp.body).toMatchObject({
      error: {
        code: "INVALID_QUERY",
        message: "Invalid query params",
        details: { errors: expect.any(Array) },
      },
      meta: { correlationId: expect.any(String) },
    });
    expect(resp.body.error.details.errors.length).toBeGreaterThan(0);
    expect(resp.body.error.details.errors[0]).toMatchObject({
      path: expect.any(String),
      message: expect.any(String),
    });
  });

  it("retorna 400 quando page é inválido", async () => {
    const resp = await api().withAuth(api().get("/api/admin/users?page=0"), token);

    expect(resp.status).toBe(400);
    expect(resp.body.error?.message).toBe("Invalid query params");
    expect(resp.body.meta?.correlationId).toEqual(expect.any(String));
  });

  it("retorna 200 com lista quando query é válida", async () => {
    const resp = await api().withAuth(api().get("/api/admin/users?page=1&limit=5"), token);

    expect(resp.status).toBe(200);
    expect(resp.body).toMatchObject({
      data: expect.any(Array),
      links: expect.any(Object),
      meta: expect.objectContaining({
        page: 1,
        limit: 5,
      }),
    });
  });
});
