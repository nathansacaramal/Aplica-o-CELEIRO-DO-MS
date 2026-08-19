import sequelize from "@/core/database";
import { Encrypter } from "@/core/interfaces";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { ProfileStrategyFactory } from "@/modules/users/domain/profile/profile-strategy-factory";
import { CreateUserRepository } from "@/modules/users/domain/repositories/create-user.repository";
import { FindUserByEmailRepository } from "@/modules/users/domain/repositories/find-user-by-email.repository";
import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { UserRole } from "../../domain/value-objects/user-role";

interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // campos extras para perfil
  clienteTelefone?: string;
  clienteEndereco?: string;
}

export class CreateUserUseCase {
  constructor(
    private readonly createUserRepo: CreateUserRepository,
    private readonly findByEmailRepo: FindUserByEmailRepository,
    private readonly encrypter: Encrypter,
    private readonly profileStrategyFactory = new ProfileStrategyFactory(),
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(dto: CreateUserDTO): Promise<UserEntity> {
    this.logger.info("Iniciando CreateUserUseCase", {
      email: dto.email,
      role: dto.role,
    });

    const existing = await this.findByEmailRepo.findByEmail(dto.email);

    if (existing) {
      throw new AppError({
        code: "EMAIL_ALREADY_IN_USE",
        message: `O e-mail ${dto.email} já está em uso`,
        statusCode: 409,
        details: { email: dto.email },
      });
    }

    const hashed = await this.encrypter.hash(dto.password);

    const transaction = await sequelize.transaction();
    try {
      const user = new UserEntity({
        id: 0,
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role,
      });

      const created = await this.createUserRepo.create(user, transaction);

      const strategy = this.profileStrategyFactory.getStrategy(created.role);

      await strategy.createProfile({
        user: created,
        payload: dto,
        transaction,
      });

      this.logger.info("Usuário + perfil criados com sucesso", {
        userId: created.id,
        email: created.email,
        role: created.role,
      });

      await transaction.commit();
      return created;
    } catch (error) {
      this.logger.error("Erro ao criar usuário + perfil", {
        error,
        email: dto.email,
        role: dto.role,
      });
      await transaction.rollback();
      throw error;
    }
  }
}
