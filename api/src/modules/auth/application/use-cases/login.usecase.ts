import { Encrypter } from "@/core/interfaces"; // seu BcryptAdapter respeita essa interface
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import {
  invalidCredentials,
  userNotFound,
  userWithoutRole,
} from "@/modules/auth/domain/errors/auth-errors";
import { AuthTokenService } from "@/modules/auth/domain/services/auth-token.service";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { FindUserByEmailRepository } from "@/modules/users/domain/repositories/find-user-by-email.repository";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserEntity["role"];
  };
}

export class LoginUseCase {
  constructor(
    private readonly findUserByEmailRepo: FindUserByEmailRepository,
    private readonly encrypter: Encrypter,
    private readonly tokenService: AuthTokenService,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    this.logger.info("Iniciando LoginUseCase", { email: input.email });

    const user = await this.findUserByEmailRepo.findByEmail(input.email);

    if (!user || !user.id) {
      this.logger.info("Usuário não encontrado para login", {
        email: input.email,
      });
      throw userNotFound(input.email);
    }

    const senhaValida = await this.encrypter.compare(input.password, user.password);

    if (!senhaValida) {
      this.logger.info("Senha inválida para login", { email: input.email });
      throw invalidCredentials();
    }

    if (!user.role) {
      this.logger.error("Usuário sem role associada", { userId: user.id });
      throw userWithoutRole(user.id);
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      sub: String(user.id),
    });

    this.logger.info("Login realizado com sucesso", {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
