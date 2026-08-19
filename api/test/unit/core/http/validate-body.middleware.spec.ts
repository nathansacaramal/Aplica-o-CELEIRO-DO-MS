import { validateBody } from "@/core/http/middlewares/validate-body";
import { z } from "zod";

describe("validateBody", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("chama next quando body válido", async () => {
    const mw = validateBody(schema);
    const req = { body: { name: "ok" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    await mw(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("retorna 400 com issues quando Zod falha", async () => {
    const mw = validateBody(schema);
    const req = { body: { name: "" }, correlationId: "vb-1" } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    await mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: "Dados inválidos",
          details: { errors: expect.any(Array) },
        }),
        meta: { correlationId: "vb-1" },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("repassa erro não-Zod ao next", async () => {
    const badSchema = {
      parseAsync: jest.fn().mockRejectedValue(new Error("boom")),
    } as any;
    const mw = validateBody(badSchema);
    const req = { body: {} } as any;
    const res = {} as any;
    const next = jest.fn();
    await mw(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
