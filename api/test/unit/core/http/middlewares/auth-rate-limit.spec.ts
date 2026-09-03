import express from "express";
import request from "supertest";
import { authRateLimiter } from "@/core/http/middlewares/auth-rate-limit";

function makeApp() {
  const app = express();
  app.use(express.json());
  // Falha sempre com 401 para exercitar a contagem (skipSuccessfulRequests não zera aqui).
  app.post("/auth/login", authRateLimiter, (_req, res) => {
    res.status(401).json({ error: { code: "INVALID_CREDENTIALS" } });
  });
  return app;
}

describe("authRateLimiter", () => {
  it("bloqueia com 429 após exceder o limite de tentativas por IP", async () => {
    const app = makeApp();
    const LIMIT = 10;

    // As primeiras `LIMIT` tentativas passam pelo handler (401).
    for (let i = 0; i < LIMIT; i += 1) {
      const res = await request(app).post("/auth/login").send({ x: i });
      expect(res.status).toBe(401);
    }

    // A seguinte é freada pelo rate limiter.
    const blocked = await request(app).post("/auth/login").send({ x: LIMIT });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({
      error: { code: "TOO_MANY_REQUESTS" },
    });
  });
});
