import path from "node:path";

describe("core/config/paths", () => {
  const mockFs = { existsSync: jest.fn() };

  beforeEach(() => {
    jest.resetModules();
    mockFs.existsSync.mockReset();

    // Alguns toolchains transformam "node:fs" em "fs" no runtime do jest.
    // Então mockamos os dois.
    jest.doMock("node:fs", () => mockFs);
    jest.doMock("fs", () => mockFs);
  });

  afterEach(() => {
    jest.dontMock("node:fs");
    jest.dontMock("fs");
  });

  it("deve resolver primeiro pelo caminho relativo ao dist (quando existir)", async () => {
    const cwdSpy = jest.spyOn(process, "cwd").mockReturnValue("/repo");

    const { resolveRuntimePath } = await import("@/core/config/paths");

    mockFs.existsSync.mockReturnValueOnce(true); // fromDist existe

    const out = resolveRuntimePath("docs/swagger/base.yaml");

    expect(mockFs.existsSync).toHaveBeenCalledTimes(1);
    expect(typeof out).toBe("string");

    cwdSpy.mockRestore();
  });

  it("deve cair para /src quando dist não existir e src existir", async () => {
    const cwdSpy = jest.spyOn(process, "cwd").mockReturnValue("/repo");
    const { resolveRuntimePath } = await import("@/core/config/paths");

    mockFs.existsSync
      .mockReturnValueOnce(false) // fromDist não existe
      .mockReturnValueOnce(true); // fromSrc existe

    const rel = "modules/users/infra/model/user-model.ts";
    const out = resolveRuntimePath(rel);

    expect(mockFs.existsSync).toHaveBeenCalledTimes(2);
    expect(out).toBe(path.resolve("/repo", "src", rel));

    cwdSpy.mockRestore();
  });

  it("deve cair para a raiz do projeto quando dist e src não existirem", async () => {
    const cwdSpy = jest.spyOn(process, "cwd").mockReturnValue("/repo");
    const { resolveRuntimePath } = await import("@/core/config/paths");

    mockFs.existsSync
      .mockReturnValueOnce(false) // fromDist não existe
      .mockReturnValueOnce(false); // fromSrc não existe

    const out = resolveRuntimePath("README.md");

    expect(mockFs.existsSync).toHaveBeenCalledTimes(2);
    expect(out).toBe(path.resolve("/repo", "README.md"));

    cwdSpy.mockRestore();
  });

  it("resolveRuntimeDir deve retornar null quando o diretório não existir", async () => {
    const cwdSpy = jest.spyOn(process, "cwd").mockReturnValue("/repo");
    const { resolveRuntimeDir } = await import("@/core/config/paths");

    // resolveRuntimeDir chama resolveRuntimePath (2 existsSync) + 1 existsSync final
    mockFs.existsSync
      .mockReturnValueOnce(false) // fromDist
      .mockReturnValueOnce(false) // fromSrc
      .mockReturnValueOnce(false); // final check

    const out = resolveRuntimeDir("modules");

    expect(out).toBeNull();
    expect(mockFs.existsSync).toHaveBeenCalled();

    cwdSpy.mockRestore();
  });
});
