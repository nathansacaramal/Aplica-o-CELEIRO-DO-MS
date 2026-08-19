// tests/helpers/api.ts
import request, { Test } from "supertest";
import app from "@/core/config/app";

export function api() {
  const base = request(app);
  const withJson = (t: Test) => t.set("Accept", "application/json");

  return {
    post: (path: string) => withJson(base.post(path)),
    get: (path: string) => withJson(base.get(path)),
    put: (path: string) => withJson(base.put(path)),
    del: (path: string) => withJson(base.delete(path)),
    withAuth: (t: Test, token: string) => t.set("Authorization", `Bearer ${token}`),
  };
}
