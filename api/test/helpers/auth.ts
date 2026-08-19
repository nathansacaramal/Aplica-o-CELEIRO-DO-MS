// tests/helpers/auth.ts
import { makeAdmin } from "../factories/admin-factory";
import { makeUser } from "../factories/user-factory";
import { api } from "./api";

export async function seedUserAndLogin({
  email,
  password = "senha123",
  role = "Admin",
  criarPerfil = true,
}: {
  email?: string;
  password?: string;
  role?: string;
  criarPerfil?: boolean;
} = {}) {
  const user = await makeUser({ email, password, role } as any);
  if (criarPerfil && role === "Admin") {
    await makeAdmin(user);
  }

  const resp = await api().post("/api/auth/login").send({ email: user.email, password });

  // Asserte aqui para falhar cedo se o login quebrar
  expect(resp.status).toBe(200);
  expect(resp.type).toMatch(/json/);
  expect(resp.body.data).toHaveProperty("accessToken");

  return { user, token: resp.body.data.accessToken };
}
