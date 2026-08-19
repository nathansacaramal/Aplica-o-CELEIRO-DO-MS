import { UserEntity } from "../entities/user.entity";

export interface FindUserByEmailRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
}
