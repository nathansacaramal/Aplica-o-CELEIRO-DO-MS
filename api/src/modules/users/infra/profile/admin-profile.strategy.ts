import {
  ProfileCreationContext,
  ProfileCreationStrategy,
} from "@/modules/users/domain/profile/profile-creation-strategy";
import { Transaction } from "sequelize";
import Admin from "../model/admin-model";

export class AdminProfileStrategy implements ProfileCreationStrategy {
  async removeProfile(userId: number, transaction: Transaction): Promise<void> {
    await Admin.destroy({ where: { userId }, transaction });
  }
  async createProfile({
    user,
    payload: _payload,
    transaction,
  }: ProfileCreationContext): Promise<void> {
    await Admin.create(
      {
        userId: user.id,
        name: user.name,
      },
      { transaction },
    );
  }
}
