import { Request, Response, NextFunction } from "express";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";

const makeReqResNext = (role?: string) => {
  const req = {
    user: role ? { role } : undefined,
  } as any as Request;

  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const res = { status } as any as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next, status, json };
};

describe("authorizeRoles middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deve chamar next quando role estiver na lista permitida", () => {
    const { req, res, next, status } = makeReqResNext("Admin");
    const middleware = authorizeRoles(["Admin"]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });

  it("deve retornar 403 quando usuário não tiver role", () => {
    const { req, res, next, status, json } = makeReqResNext();
    const middleware = authorizeRoles(["Admin"]);

    middleware(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: { code: "FORBIDDEN", message: "Acesso negado" },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 403 quando role não estiver permitida", () => {
    const { req, res, next, status, json } = makeReqResNext("Cliente");
    const middleware = authorizeRoles(["Admin"]);

    middleware(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: { code: "FORBIDDEN", message: "Acesso negado" },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("deve tratar role sem case-sensitive (lowercase/uppercase)", () => {
    const { req, res, next, status } = makeReqResNext("Admin");
    const middleware = authorizeRoles(["admin"]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });
});
