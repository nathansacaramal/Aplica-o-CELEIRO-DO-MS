import { BcryptAdapter } from "@/core/adapters/bcrypt-adapter";
import { Controller } from "@/core/protocols";
import { logger } from "@/core/config/logger";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.usecase";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/refresh-token.usecase";
import { JwtAuthTokenService } from "@/modules/auth/infra/jwt-auth-token.service";
import { SequelizeUserRepository } from "@/modules/users/infra/sequelize/sequelize-user.repository";
import { LoginController } from "../controllers/login.controller";
import { RefreshTokenController } from "../controllers/refresh-token.controller";

export function makeLoginController(): Controller {
  const userRepo = new SequelizeUserRepository();
  const tokenService = new JwtAuthTokenService();
  const encrypter = new BcryptAdapter(12);
  const loginUseCase = new LoginUseCase(userRepo, encrypter, tokenService, logger);
  return new LoginController(loginUseCase);
}

export function makeRefreshTokenController(): Controller {
  const userRepo = new SequelizeUserRepository();
  const tokenService = new JwtAuthTokenService();
  const refreshUseCase = new RefreshTokenUseCase(tokenService, userRepo, logger);
  return new RefreshTokenController(refreshUseCase);
}
