import { Transaction } from "sequelize";
import { UserEntity } from "../entities/user.entity";

export interface FindUserByIdRepository {
  findById(id: number, t?: Transaction): Promise<UserEntity | null>;
}
