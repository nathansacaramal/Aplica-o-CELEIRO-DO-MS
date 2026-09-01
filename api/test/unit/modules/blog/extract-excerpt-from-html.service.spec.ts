import { extractExcerptFromHtml } from "@/modules/blog/application/services/extract-excerpt-from-html.service";

describe("extractExcerptFromHtml", () => {
  it("remove tags HTML e colapsa espaços", () => {
    const html = "<p>Festival de   Inverno</p><p>movimenta <strong>Nova Andradina</strong>.</p>";
    expect(extractExcerptFromHtml(html)).toBe("Festival de Inverno movimenta Nova Andradina.");
  });

  it("corta em ~220 caracteres sem quebrar palavra no meio, com reticências", () => {
    const longText = "palavra ".repeat(40).trim();
    const html = `<p>${longText}</p>`;

    const out = extractExcerptFromHtml(html);

    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(221);
    expect(out.includes("<")).toBe(false);
  });

  it("retorna o texto integral quando já é curto", () => {
    expect(extractExcerptFromHtml("<p>Curto</p>")).toBe("Curto");
  });
});
