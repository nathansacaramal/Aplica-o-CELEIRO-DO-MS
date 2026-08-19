import { errorResponse, mapErrorToHttpResponse } from "@/core/http/http-error-response";
import { AppError } from "@/core/errors-app-error";

describe("core/http/http-error-response", () => {
  it("errorResponse() deve montar payload padrão com statusCode, error e meta.correlationId", () => {
    const resp = errorResponse(400, "VALIDATION_ERROR", "Validation error", "corr-123", {
      field: "email",
    });

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: { field: "email" },
      },
      meta: {
        correlationId: "corr-123",
      },
    });
  });

  it("mapErrorToHttpResponse() deve mapear AppError corretamente", () => {
    const err = new AppError({
      code: "EMAIL_ALREADY_IN_USE",
      message: "O e-mail já está em uso",
      statusCode: 409,
      details: { email: "x@y.com" },
    });

    const resp = mapErrorToHttpResponse(err, "corr-999");

    expect(resp.statusCode).toBe(409);
    expect(resp.body).toEqual({
      error: {
        code: "EMAIL_ALREADY_IN_USE",
        message: "O e-mail já está em uso",
        details: { email: "x@y.com" },
      },
      meta: {
        correlationId: "corr-999",
      },
    });
  });

  it("mapErrorToHttpResponse() deve retornar fallback 500 para erros desconhecidos", () => {
    const resp = mapErrorToHttpResponse(new Error("boom"), "corr-500");

    expect(resp.statusCode).toBe(500);
    expect(resp.body).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        details: undefined,
      },
      meta: {
        correlationId: "corr-500",
      },
    });
  });
});
