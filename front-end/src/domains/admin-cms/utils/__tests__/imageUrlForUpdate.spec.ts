import { describe, expect, it } from "vitest";
import { imageUrlForUpdate } from "../imageUrlForUpdate";

describe("imageUrlForUpdate", () => {
  it("retorna undefined quando o valor não mudou (mantém imagem atual)", () => {
    const original = "https://api.exemplo.com/uploads/public/cities/a.png";
    expect(imageUrlForUpdate(original, original)).toBeUndefined();
  });

  it("ignora espaços em volta ao comparar", () => {
    const original = "https://api.exemplo.com/uploads/public/cities/a.png";
    expect(imageUrlForUpdate(`  ${original}  `, original)).toBeUndefined();
  });

  it("retorna o novo valor quando o usuário escolheu um arquivo novo", () => {
    const original = "https://api.exemplo.com/uploads/public/cities/a.png";
    const next = "data:image/png;base64,AAAA";
    expect(imageUrlForUpdate(next, original)).toBe(next);
  });

  it("retorna o novo valor quando o usuário colou uma URL diferente", () => {
    const original = "https://api.exemplo.com/uploads/public/cities/a.png";
    const next = "https://outra-fonte.com/imagem.jpg";
    expect(imageUrlForUpdate(next, original)).toBe(next);
  });

  it("retorna undefined quando o campo foi limpo (não força remoção sem substituto)", () => {
    const original = "https://api.exemplo.com/uploads/public/cities/a.png";
    expect(imageUrlForUpdate("", original)).toBeUndefined();
  });
});
