import { Transaction } from "sequelize";
import { UserEntity } from "../entities/user.entity";

export interface ProfileCreationContext {
  user: UserEntity;
  payload: unknown;
  transaction: Transaction;
}

export interface ProfileCreationStrategy {
  createProfile(ctx: ProfileCreationContext): Promise<void>;
  removeProfile(userId: number, transaction: Transaction): Promise<void>;
}
