import UserModel from "@/modules/users/infra/model/user-model";
import { UserEntity } from "../../domain/entities/user.entity";

export function userModelToEntity(user: UserModel): UserEntity {
  return new UserEntity({
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  });
}
