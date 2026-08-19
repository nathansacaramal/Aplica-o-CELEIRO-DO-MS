// src/types/login/index.ts
import * as z from "zod";
import {
  authResponseSchema,
  loginResponseSchema,
  loginSchema,
  refreshTokenSchema,
} from "../../presentation/http/validators/auth-schemas";

export type LoginDTO = z.infer<typeof loginSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

/**
 * AuthResponseDTO deve representar a resposta REST + HATEOAS
 * gerada pelos controllers de autenticação (tokens, usuário, links, etc.).
 */
export type AuthResponseDTO = z.infer<typeof authResponseSchema>;
export type LoginResponseDTO = z.infer<typeof loginResponseSchema>;
