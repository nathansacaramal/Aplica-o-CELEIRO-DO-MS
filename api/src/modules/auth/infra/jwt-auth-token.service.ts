import jwt from "jsonwebtoken";
import { AuthTokenService } from "@/modules/auth/domain/services/auth-token.service";
import { ENV } from "@/core/config/env";

const ACCESS_TOKEN_EXP = "15m";
const REFRESH_TOKEN_EXP = "7d";

export class JwtAuthTokenService implements AuthTokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    const access = ENV.JWT_ACCESS_SECRET ?? ENV.JWT_SECRET;
    const refresh = ENV.JWT_REFRESH_SECRET ?? access;

    if (!access) throw new Error("JWT access secret not configured");
    if (!refresh) throw new Error("JWT refresh secret not configured");

    this.accessSecret = access;
    this.refreshSecret = refresh;
  }
  generateAccessToken(payload: { sub: string; email: string; role: string }): string {
    return jwt.sign({ email: payload.email, role: payload.role }, this.accessSecret, {
      subject: payload.sub,
      expiresIn: ACCESS_TOKEN_EXP,
      algorithm: "HS256",
    });
  }

  generateRefreshToken(payload: { sub: string }): string {
    return jwt.sign({}, this.refreshSecret, {
      subject: payload.sub,
      expiresIn: REFRESH_TOKEN_EXP,
      algorithm: "HS256",
    });
  }
  decodeRefreshToken(token: string): { sub: string; email?: string; role?: string } | null {
    const decoded = jwt.verify(token, this.refreshSecret, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
    return {
      sub: String(decoded.sub),
      email: decoded.email as string | undefined,
      role: decoded.role as string | undefined,
    };
  }
}
