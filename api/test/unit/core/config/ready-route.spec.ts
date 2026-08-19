import { createApp } from "@/core/config/app";
import sequelize from "@/core/database";
import request from "supertest";

describe("GET /ready", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("retorna 200 quando authenticate resolve", async () => {
    jest.spyOn(sequelize, "authenticate").mockResolvedValue(undefined);
    const app = createApp();
    const res = await request(app).get("/ready");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ready",
      dbChecked: true,
      meta: { correlationId: expect.any(String) },
    });
  });

  it("retorna 503 quando authenticate falha", async () => {
    jest.spyOn(sequelize, "authenticate").mockRejectedValue(new Error("connection refused"));
    const app = createApp();
    const res = await request(app).get("/ready");
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      status: "not_ready",
      error: {
        code: "NOT_READY",
        message: "connection refused",
      },
      meta: { correlationId: expect.any(String) },
    });
  });
});
