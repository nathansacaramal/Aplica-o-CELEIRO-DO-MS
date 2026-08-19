import { AuthTokenService } from "@/modules/auth/domain/services/auth-token.service";
import { invalidRefreshToken } from "@/modules/auth/domain/errors/auth-errors";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { FindUserByIdRepository } from "@/modules/users/domain/repositories/find-user-by-id.repository";
import { userNotFound } from "@/modules/users/domain/errors/user-errors";

interface RefreshTokenOutput {
  accessToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: AuthTokenService,
    private readonly findUserByIdRepo: FindUserByIdRepository,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenOutput> {
    this.logger.info("Iniciando RefreshTokenUseCase");

    const decoded = this.tokenService.decodeRefreshToken(refreshToken);

    if (!decoded?.sub) {
      this.logger.error("Refresh token inválido ou sem sub");
      throw invalidRefreshToken();
    }

    // ✅ buscar usuário para obter email/role reais
    const user = await this.findUserByIdRepo.findById(Number(decoded.sub));

    if (!user) {
      this.logger.error("Usuário do refresh token não encontrado", {
        userId: decoded.sub,
      });
      throw userNotFound(Number(decoded.sub)); // ✅ agora com argumento
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    this.logger.info("Novo access token gerado via refresh", {
      userId: String(user.id),
    });

    return { accessToken };
  }
}
