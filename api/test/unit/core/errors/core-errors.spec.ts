import { unAuthorizedError } from "@/core/errors/unauthorized-error";
import { InvalidParamError } from "@/core/errors/invalid-param-errors";
import { MissingParamError } from "@/core/errors/missing-param-errors";
import { ServerError } from "@/core/errors/server-errors";
import { cityNotFound } from "@/modules/cities/domain/errors/city-errors";

describe("core / domain errors", () => {
  it("unAuthorizedError", () => {
    const e = new unAuthorizedError();
    expect(e.name).toBe("unAuthorizedError");
    expect(e.message).toContain("login");
  });

  it("InvalidParamError e MissingParamError", () => {
    expect(new InvalidParamError("x").message).toContain("x");
    expect(new MissingParamError("y").message).toContain("y");
  });

  it("ServerError sem e com Error", () => {
    const plain = new ServerError();
    expect(plain.message).toBe("Internal server error");
    const inner = new Error("inner");
    const wrapped = new ServerError(inner);
    expect(wrapped.message).toBe("inner");
  });

  it("cityNotFound", () => {
    const e = cityNotFound(5);
    expect(e.statusCode).toBe(404);
    expect(String(e.message)).toContain("5");
  });
});
