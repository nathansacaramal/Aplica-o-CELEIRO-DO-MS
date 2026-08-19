import { UserEntity, UserProps } from "../entities/user.entity";

export interface UpdateUserRepository {
  update(id: number, data: Partial<UserProps>): Promise<UserEntity | null>;
}
