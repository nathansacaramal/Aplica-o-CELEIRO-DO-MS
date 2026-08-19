import { z } from "zod";
import { pt } from "zod/locales";
z.config(pt());

export const createUserSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Nome é obrigatório" : "Nome deve ser um texto",
    })
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  email: z.email({
    error: (issue) =>
      issue.input === undefined ? "Email é obrigatório" : "Email deve ser um texto",
  }),

  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Senha é obrigatória" : "Senha deve ser um texto",
    })
    .min(6, "Senha deve ter pelo menos 6 caracteres"),

  role: z.enum(["Admin"], {
    error: (issue) => {
      if (!["Admin"].some((element) => element === issue.input)) {
        return `A Role ${issue.input} é inválida`;
      }
    },
  }),
});

export const updateUserSchema = z.object({
  name: z
    .string({
      error: (issue) => {
        if (typeof issue.input !== "string") {
          return "Nome deve ser um texto";
        }
      },
    })
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .optional(),

  email: z
    .email({
      error: (issue) =>
        typeof issue.input === "string" ? "Email deve ser um texto" : "Email inválido",
    })
    .optional(),

  password: z
    .string({
      error: (issue) => {
        if (typeof issue.input !== "string") {
          return "Senha deve ser um texto";
        }
      },
    })
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional(),

  role: z
    .enum(["Admin"], {
      error: (issue) => {
        if (!["Admin"].some((element) => element === issue.input)) {
          return `A Role ${issue.input} é inválida`;
        }
      },
    })
    .optional(),
});

export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    sortBy: z.enum(["name", "email", "createdAt"]).optional(),
    sortDir: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();
