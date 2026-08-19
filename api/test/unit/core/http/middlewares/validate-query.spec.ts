import { validateQuery } from "@/core/http/middlewares/validate-query";
import { z, ZodObject } from "zod";

describe("validateQuery", () => {
  const schema = z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(10).default(5),
    })
    .strict();

  it("parseia query, define validatedQuery e chama next", () => {
    const mw = validateQuery(schema);
    const req = { query: { page: "2", limit: "3" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ page: 2, limit: 3 });
  });

  it("retorna 400 com issues quando Zod falha", () => {
    const mw = validateQuery(schema);
    const req = {
      query: { page: "0", limit: "1" },
      correlationId: "vq-1",
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "INVALID_QUERY",
          message: "Parâmetros de busca inválidos",
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                path: expect.any(String),
                message: expect.any(String),
              }),
            ]),
          },
        }),
        meta: { correlationId: "vq-1" },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("rejeita chaves extras com .strict()", () => {
    const mw = validateQuery(schema);
    const req = { query: { page: "1", extra: "x" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("repassa erro não-Zod ao next", () => {
    const boomSchema = {
      parse: jest.fn(() => {
        throw new Error("boom");
      }),
    } as unknown as ZodObject<Record<string, z.ZodTypeAny>>;

    const mw = validateQuery(boomSchema);
    const req = { query: {} } as any;
    const res = { status: jest.fn(), json: jest.fn() } as any;
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
