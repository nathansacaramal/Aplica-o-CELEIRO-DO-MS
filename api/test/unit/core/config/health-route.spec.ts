import { createApp } from "@/core/config/app";
import request from "supertest";

describe("GET /health", () => {
  it("retorna 200 sem depender do banco", async () => {
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      meta: { correlationId: expect.any(String) },
    });
    expect(typeof res.body.uptimeSeconds).toBe("number");
  });
});
