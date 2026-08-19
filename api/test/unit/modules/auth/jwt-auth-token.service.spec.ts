import { JwtAuthTokenService } from "@/modules/auth/infra/jwt-auth-token.service";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe("JwtAuthTokenService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generateAccessToken delega a jwt.sign com subject e claims", () => {
    (jwt.sign as jest.Mock).mockReturnValue("access.jwt");
    const sut = new JwtAuthTokenService();
    const token = sut.generateAccessToken({
      sub: "9",
      email: "a@b.com",
      role: "Admin",
    });
    expect(token).toBe("access.jwt");
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: "a@b.com", role: "Admin" },
      expect.any(String),
      expect.objectContaining({
        subject: "9",
        algorithm: "HS256",
        expiresIn: "15m",
      }),
    );
  });

  it("generateRefreshToken delega a jwt.sign com subject vazio e expiração longa", () => {
    (jwt.sign as jest.Mock).mockReturnValue("refresh.jwt");
    const sut = new JwtAuthTokenService();
    const token = sut.generateRefreshToken({ sub: "9" });
    expect(token).toBe("refresh.jwt");
    expect(jwt.sign).toHaveBeenCalledWith(
      {},
      expect.any(String),
      expect.objectContaining({
        subject: "9",
        algorithm: "HS256",
        expiresIn: "7d",
      }),
    );
  });

  it("decodeRefreshToken retorna sub como string e campos opcionais", () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      sub: 42,
      email: "x@y.com",
      role: "Admin",
    });
    const sut = new JwtAuthTokenService();
    expect(sut.decodeRefreshToken("tok")).toEqual({
      sub: "42",
      email: "x@y.com",
      role: "Admin",
    });
    expect(jwt.verify).toHaveBeenCalledWith("tok", expect.any(String), {
      algorithms: ["HS256"],
    });
  });

  it("decodeRefreshToken propaga erro de verify (ex.: token expirado)", () => {
    const { TokenExpiredError } = jest.requireActual<typeof import("jsonwebtoken")>("jsonwebtoken");
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new TokenExpiredError("jwt expired", new Date());
    });
    const sut = new JwtAuthTokenService();
    expect(() => sut.decodeRefreshToken("bad")).toThrow(TokenExpiredError);
  });
});
