import sequelize from "@/core/database";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { ProfileStrategyFactory } from "../../domain/profile/profile-strategy-factory";
import { DeleteUserRepository } from "../../domain/repositories/delete-user.repository";
import { FindUserByIdRepository } from "../../domain/repositories/find-user-by-id.repository";

export class DeleteUserUseCase {
  constructor(
    private readonly findByIdRepo: FindUserByIdRepository,
    private readonly deleteUserRepo: DeleteUserRepository,
    private readonly profileStrategyFactory = new ProfileStrategyFactory(),
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(id: number): Promise<boolean> {
    const deleted = await sequelize.transaction(async (t) => {
      const existing = await this.findByIdRepo.findById(id);

      if (!existing?.id) {
        this.logger.info("DeleteUserUseCase: usuário não encontrado", { id });
        return false; // ✅ o sequelize vai commitar “nada” e ok
      }

      const strategy = this.profileStrategyFactory.getStrategy(existing.role);

      // ✅ Remover perfil com a MESMA transaction
      await strategy.removeProfile(existing.id, t);

      // ✅ Remover user com a MESMA transaction
      const result = await this.deleteUserRepo.delete(existing.id, t);

      return result; // ✅ sem commit manual
    });

    this.logger.info("DeleteUserUseCase: usuário deletado", { id, deleted });
    return deleted;
  }
}
