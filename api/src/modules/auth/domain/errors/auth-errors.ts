import { AppError } from "@/core/errors-app-error";

export const invalidCredentials = () =>
  new AppError({
    code: "INVALID_CREDENTIALS",
    message: "E-mail ou senha inválidos",
    statusCode: 401,
  });

export const userNotFound = (email: string) =>
  new AppError({
    code: "AUTH_USER_NOT_FOUND",
    message: `Usuário com e-mail ${email} não foi encontrado`,
    statusCode: 404,
    details: { email },
  });

export const userWithoutRole = (userId: number) =>
  new AppError({
    code: "USER_WITHOUT_ROLE",
    message: `Usuário ${userId} não possui perfil associado`,
    statusCode: 500,
    details: { userId },
  });

export const invalidRefreshToken = () =>
  new AppError({
    code: "INVALID_REFRESH_TOKEN",
    message: "Refresh token inválido ou expirado",
    statusCode: 401,
  });
