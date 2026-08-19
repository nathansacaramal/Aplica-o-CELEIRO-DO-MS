import { AppError } from "@/core/errors-app-error";

export const cityNotFound = (id: number) =>
  new AppError({
    code: "CITY_NOT_FOUND",
    message: `Cidade com id ${id} não foi encontrada`,
    statusCode: 404,
    details: { id },
  });
