// tests/factories/user-factory.ts
import User from "@/modules/users/infra/model/user-model";
import { BcryptAdapter } from "@/core/adapters/bcrypt-adapter";
import { ENV } from "@/core/config/env";

const encrypter = new BcryptAdapter(ENV.SALT);

export async function makeUser(attrs?: Partial<User>): Promise<User> {
  const senhaCriptografada = await encrypter.hash(attrs?.password ?? "senha123");
  return User.create({
    name: attrs?.name ?? "John Doe",
    email: attrs?.email ?? `john${Date.now()}@dominio.com`,
    password: senhaCriptografada,
    role: attrs?.role ?? "Admin",
  } as any);
}
