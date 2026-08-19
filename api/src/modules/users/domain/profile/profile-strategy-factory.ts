import { ProfileCreationStrategy } from "./profile-creation-strategy";
import { AppError } from "@/core/errors-app-error";
import { AdminProfileStrategy } from "../../infra/profile/admin-profile.strategy";
import { UserRole } from "../value-objects/user-role";

export class ProfileStrategyFactory {
  private readonly strategies: Record<UserRole, ProfileCreationStrategy>;

  constructor() {
    this.strategies = {
      Admin: new AdminProfileStrategy(),
    };
  }

  getStrategy(role: UserRole): ProfileCreationStrategy {
    const strategy = this.strategies[role];

    if (!strategy) {
      throw new AppError({
        code: "PROFILE_STRATEGY_NOT_FOUND",
        message: `Nenhuma estratégia de perfil encontrada para role ${role}`,
        statusCode: 400,
      });
    }

    return strategy;
  }
}
