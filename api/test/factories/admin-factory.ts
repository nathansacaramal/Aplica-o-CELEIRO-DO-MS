// tests/factories/admin-factory.ts
import Admin from "@/modules/users/infra/model/admin-model";
import User from "@/modules/users/infra/model/user-model";

export async function makeAdmin(user: User, attrs?: Partial<Admin>) {
  return Admin.create({
    userId: user.id,
    name: attrs?.name ?? user.name,
  } as any);
}
