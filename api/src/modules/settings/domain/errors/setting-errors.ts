import { AppError } from "@/core/errors-app-error";

export const settingNotFound = (key: string) =>
  new AppError({
    code: "SETTING_NOT_FOUND",
    message: `Configuração "${key}" não foi encontrada`,
    statusCode: 404,
    details: { key },
  });
