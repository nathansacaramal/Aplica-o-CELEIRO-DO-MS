import { Transaction } from "sequelize";

export interface DeleteUserRepository {
  delete(id: number, transaction?: Transaction): Promise<boolean>;
}
