import { Transaction } from "sequelize";
import { UserEntity } from "../entities/user.entity";

export interface CreateUserRepository {
  create(user: UserEntity, t?: Transaction): Promise<UserEntity>;
}
