import { correlationIdMiddleware } from "@/core/http/middlewares/correlation-id";

describe("correlation-id middleware", () => {
  const makeReqResNext = (incoming?: string) => {
    const headers: Record<string, string> = incoming ? { "x-correlation-id": incoming } : {};
    const req: any = {
      headers,
      // ✅ Express oferece req.header(name)
      header: (name: string) => {
        const key = name.toLowerCase();
        return headers[key];
      },
    };

    const res: any = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();
    return { req, res, next };
  };

  it("deve gerar correlationId quando não existir", () => {
    const { req, res, next } = makeReqResNext();

    correlationIdMiddleware(req, res, next);

    expect(req.correlationId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith("x-correlation-id", req.correlationId);
    expect(next).toHaveBeenCalled();
  });

  it("deve reutilizar correlationId quando vier no header", () => {
    const { req, res, next } = makeReqResNext("corr-123");

    correlationIdMiddleware(req, res, next);

    expect(req.correlationId).toBe("corr-123");
    expect(res.setHeader).toHaveBeenCalledWith("x-correlation-id", "corr-123");
    expect(next).toHaveBeenCalled();
  });
});
