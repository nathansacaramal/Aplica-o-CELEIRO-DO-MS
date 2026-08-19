export interface AuthTokenService {
  generateAccessToken(payload: { sub: string; email: string; role: string }): string;

  generateRefreshToken(payload: { sub: string }): string;

  decodeRefreshToken(token: string): {
    sub: string;
    email?: string;
    role?: string;
  } | null;
}
