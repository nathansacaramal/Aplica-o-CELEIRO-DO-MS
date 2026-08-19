import { resolveUploadExtension } from "@/modules/media/infra/storage/resolve-upload-extension";

describe("resolveUploadExtension", () => {
  it("usa extensão do filename quando válida (minúscula)", () => {
    expect(resolveUploadExtension("foto.PNG", "image/jpeg")).toBe(".png");
    expect(resolveUploadExtension("doc.TXT", "text/plain")).toBe(".txt");
  });

  it("ignora extensão inválida ou vazia e cai no MIME", () => {
    expect(resolveUploadExtension("", "image/png")).toBe(".png");
    expect(resolveUploadExtension("sem-extensao", "image/webp")).toBe(".webp");
    expect(resolveUploadExtension("bad.", "image/gif")).toBe(".gif");
  });

  it("rejeita extensão com caracteres fora de [a-z0-9] após o ponto", () => {
    expect(resolveUploadExtension("file.a_b", "image/png")).toBe(".png");
  });

  it("rejeita extensão com mais de 15 caracteres após o ponto", () => {
    const long = `.${"a".repeat(16)}`;
    expect(resolveUploadExtension(`x${long}`, "image/jpeg")).toBe(".jpg");
  });

  it("aceita extensão com até 15 caracteres alfanuméricos", () => {
    expect(resolveUploadExtension(`x.${"a".repeat(15)}`, "image/png")).toBe(`.${"a".repeat(15)}`);
  });

  it("mapeia MIME conhecidos e usa .bin como fallback", () => {
    expect(resolveUploadExtension(undefined, "image/jpeg")).toBe(".jpg");
    expect(resolveUploadExtension(undefined, "image/jpg")).toBe(".jpg");
    expect(resolveUploadExtension(undefined, "image/png")).toBe(".png");
    expect(resolveUploadExtension(undefined, "image/webp")).toBe(".webp");
    expect(resolveUploadExtension(undefined, "image/gif")).toBe(".gif");
    expect(resolveUploadExtension(undefined, "text/plain")).toBe(".txt");
    expect(resolveUploadExtension(undefined, "application/octet-stream")).toBe(".bin");
  });

  it("normaliza espaços no MIME", () => {
    expect(resolveUploadExtension(undefined, "  IMAGE/PNG  ")).toBe(".png");
  });
});
