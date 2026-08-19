import { ENV } from "@/core/config/env";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

jest.mock("@/core/config/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

describe("auth-middleware", () => {
  const makeReqResNext = (auth?: string) => {
    const req: any = {
      headers: auth ? { authorization: auth } : {},
      path: "/api/test",
      method: "GET",
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    return { req, res, next };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ENV as any).JWT_SECRET = (ENV as any).JWT_SECRET ?? "secret";
  });

  it("deve retornar 401 quando não houver Authorization header", () => {
    const { req, res, next } = makeReqResNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "UNAUTHORIZED" }),
        links: expect.arrayContaining([expect.objectContaining({ href: "/api/auth/login" })]),
      }),
    );
    expect(res.json.mock.calls[0][0].error?.token).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando token for inválido", () => {
    const { req, res, next } = makeReqResNext("Bearer invalid");

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando scheme não for Bearer", () => {
    const { req, res, next } = makeReqResNext("Basic dGVzdA==");
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando header for só Bearer sem token", () => {
    const { req, res, next } = makeReqResNext("Bearer");
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("deve retornar 500 quando JWT_ACCESS_SECRET não estiver configurado", () => {
    const prev = ENV.JWT_ACCESS_SECRET;
    try {
      (ENV as { JWT_ACCESS_SECRET: string }).JWT_ACCESS_SECRET = "";
      const { req, res, next } = makeReqResNext("Bearer token");
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: "INTERNAL_ERROR" }),
        }),
      );
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    } finally {
      (ENV as { JWT_ACCESS_SECRET: string }).JWT_ACCESS_SECRET = prev;
    }
  });

  it("deve chamar next e injetar req.user quando token for válido", () => {
    const { req, res, next } = makeReqResNext("Bearer valid-token");

    (jwt.verify as jest.Mock).mockReturnValue({
      sub: "10",
      email: "user@mail.com",
      role: "Admin",
    });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid-token",
      expect.any(String), // ✅ não fixa o secret
      { algorithms: ["HS256"] },
    );

    expect(req.user).toEqual({
      id: "10",
      email: "user@mail.com",
      role: "Admin",
    });

    expect(next).toHaveBeenCalled();
  });
});
