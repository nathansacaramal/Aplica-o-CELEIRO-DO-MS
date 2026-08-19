import * as z from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "O email está no formato incorreto" }),
  password: z
    .string()
    .min(6, { error: "A senha deve ter no minimo 6 caracteres" })
    .max(8, { error: "A senha deve ter no máximo 8 caracteres" }),
});

export const loginResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
  refreshToken: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ error: "O refresh token é obrigatório" }),
});

export const authResponseSchema = z.object({
  token: z.string(),
  userId: z.number(),
  role: z.enum(["Admin"]),
});
