import { Transaction } from "sequelize";

export interface DeleteBlogPostRepository {
  delete(id: number, t?: Transaction): Promise<boolean>;
}
