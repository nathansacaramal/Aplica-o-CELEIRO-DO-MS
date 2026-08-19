import { AppError } from "@/core/errors-app-error";
import { logger } from "@/core/config/logger";
import { FindUserByIdRepository } from "../../domain/repositories/find-user-by-id.repository";
import { UserEntity } from "../../domain/entities/user.entity";

export class GetUserByIdUseCase {
  constructor(private readonly findByIdRepo: FindUserByIdRepository) {}

  async execute(id: number): Promise<UserEntity> {
    const user = await this.findByIdRepo.findById(id);

    if (!user) {
      logger.info("GetUserByIdUseCase: usuário não encontrado", { id });
      throw new AppError({
        code: "USER_NOT_FOUND",
        message: "Usuário não encontrado",
        statusCode: 404,
        details: { id },
      });
    }

    logger.debug("GetUserByIdUseCase: usuário encontrado", { id });
    return user;
  }
}
