import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { ensureCorrelationId } from "@/core/http/correlation";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 10; // tentativas por IP na janela

/**
 * Freio contra brute force nas rotas de autenticação (`/auth/login`,
 * `/auth/refresh-token`). Limita por IP — o app já roda com `trust proxy` em
 * produção, então `req.ip` reflete o cliente real atrás do Railway.
 *
 * A resposta segue o mesmo envelope de erro do resto da API (code + meta),
 * para o front tratar `429` como qualquer outro erro.
 */
export const authRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: MAX_ATTEMPTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Tentativas bem-sucedidas não gastam a cota: quem acerta a senha não é freado.
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    const correlationId = ensureCorrelationId(
      (req as { correlationId?: string }).correlationId,
    );
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      },
      meta: { correlationId },
    });
  },
});
