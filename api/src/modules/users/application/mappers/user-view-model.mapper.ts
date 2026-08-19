import type { UserViewModel } from "../dto";
import type { UserEntity } from "../../domain/entities/user.entity";

export function toUserViewModel(entity: UserEntity): UserViewModel {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    role: entity.role,
  };
}
