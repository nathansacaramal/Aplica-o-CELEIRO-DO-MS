import { AppError } from "@/core/errors-app-error";
import setupErrorHandlers from "@/core/http/middlewares/error-handlers";
import type { Express } from "express";

describe("error-handlers", () => {
  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  it("deve responder 404 no notFoundHandler com envelope padrão", () => {
    const app: { use: jest.Mock } = { use: jest.fn() };
    setupErrorHandlers(app as unknown as Express);

    const notFound = app.use.mock.calls[0][0];

    const res = makeRes();
    notFound({ correlationId: "nf-1" }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Rota não encontrada",
      },
      meta: { correlationId: "nf-1" },
    });
  });

  it("deve mapear AppError com status e correlationId", () => {
    process.env.NODE_ENV = "production";

    const app: { use: jest.Mock } = { use: jest.fn() };
    setupErrorHandlers(app as unknown as Express);

    const errorHandler = app.use.mock.calls[1][0];

    const res = makeRes();
    const err = new AppError({
      code: "BAD",
      message: "Erro custom",
      statusCode: 400,
    });

    errorHandler(err, { correlationId: "eh-1" }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "BAD",
        message: "Erro custom",
      },
      meta: { correlationId: "eh-1" },
    });
  });

  it("deve retornar 500 para erro genérico com envelope", () => {
    process.env.NODE_ENV = "production";

    const app: { use: jest.Mock } = { use: jest.fn() };
    setupErrorHandlers(app as unknown as Express);

    const errorHandler = app.use.mock.calls[1][0];

    const res = makeRes();

    errorHandler(new Error("boom"), { correlationId: "eh-2" }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
        }),
        meta: { correlationId: "eh-2" },
      }),
    );
  });

  it("erro genérico em desenvolvimento mantém envelope sem stack no corpo", () => {
    process.env.NODE_ENV = "development";

    const app: { use: jest.Mock } = { use: jest.fn() };
    setupErrorHandlers(app as unknown as Express);

    const errorHandler = app.use.mock.calls[1][0];

    const res = makeRes();
    const err = new Error("boom");

    errorHandler(err, { correlationId: "eh-3" }, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
        }),
        meta: { correlationId: "eh-3" },
      }),
    );
  });
});
