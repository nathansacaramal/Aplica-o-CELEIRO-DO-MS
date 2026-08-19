import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export interface ProfileCreator {
  createForUser(user: UserEntity, payload: unknown): Promise<void>;
}
