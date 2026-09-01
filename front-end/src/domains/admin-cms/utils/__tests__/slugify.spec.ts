import { describe, expect, it } from "vitest";
import { slugify } from "../slugify";

describe("slugify", () => {
  it("remove acentos e coloca em minúsculo", () => {
    expect(slugify("Festival Gastronômico de Itaporã")).toBe(
      "festival-gastronomico-de-itapora",
    );
  });

  it("troca espaços e pontuação por hífen único", () => {
    expect(slugify("Praça  Central, de Itaporã!")).toBe(
      "praca-central-de-itapora",
    );
  });

  it("remove hífens nas pontas", () => {
    expect(slugify("  -Festa da mandioca- ")).toBe("festa-da-mandioca");
  });

  it("mantém números", () => {
    expect(slugify("Corrida 5km 2026")).toBe("corrida-5km-2026");
  });
});
