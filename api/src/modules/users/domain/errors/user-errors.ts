import { AppError } from "@/core/errors-app-error";

export const userNotFound = (id: number) =>
  new AppError({
    code: "USER_NOT_FOUND",
    message: `Usuário com id ${id} não foi encontrado`,
    statusCode: 404,
    details: { id },
  });

export const emailAlreadyInUse = (email: string) =>
  new AppError({
    code: "EMAIL_ALREADY_IN_USE",
    message: `O e-mail ${email} já está em uso`,
    statusCode: 409,
    details: { email },
  });
