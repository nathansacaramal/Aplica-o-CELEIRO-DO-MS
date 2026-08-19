import path from "path";
import os from "node:os";
import fs from "node:fs/promises";
import crypto from "crypto";
import { LocalMediaStorageService } from "../../../../src/modules/media/infra/storage/local-media-storage.service";

// Mocka tudo que faz I/O via paths
jest.mock("@/core/config/paths", () => {
  const actual = jest.requireActual("@/core/config/paths");
  return {
    ...actual,
    ensureDir: jest.fn(async () => undefined),
    writeBufferFile: jest.fn(async () => undefined),
  };
});

import { ensureDir, writeBufferFile } from "../../../../src/core/config/paths";

describe("LocalMediaStorageService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("deve criar diretório e salvar arquivo, retornando path público quando publicBasePath existir", async () => {
    jest.spyOn(crypto, "randomUUID").mockReturnValue("uuid-1-uuid-1-uuid-1-uuid-1");

    const svc = new LocalMediaStorageService({
      rootDir: "/tmp/uploads",
      publicBasePath: "/uploads",
    });

    const buffer = Buffer.from("hello");
    const result = await svc.save({
      filename: "foto.png",
      mimeType: "image/png",
      buffer,
      folder: "/users/10",
      visibility: "public",
    });

    // dir normalizado (remove / inicial)
    expect(ensureDir).toHaveBeenCalledWith(path.join("/tmp/uploads", "public", "users/10"));

    // arquivo salvo
    expect(writeBufferFile).toHaveBeenCalledWith(
      path.join("/tmp/uploads/public", "users/10", "uuid-1-uuid-1-uuid-1-uuid-1.png"),
      buffer,
    );

    // retorno
    expect(result).toEqual({
      path: "/uploads/public/users/10/uuid-1-uuid-1-uuid-1-uuid-1.png",
      size: 5,
      mimeType: "image/png",
    });
  });

  it("deve retornar filePath quando publicBasePath não existir", async () => {
    jest.spyOn(crypto, "randomUUID").mockReturnValue("uuid-2-uuid-2-uuid-2-uuid-2");

    const svc = new LocalMediaStorageService({
      rootDir: "/tmp/uploads",
    });

    const buffer = Buffer.from("abc");
    const result = await svc.save({
      filename: "doc.txt",
      mimeType: "text/plain",
      buffer,
      folder: "docs",
    });

    expect(result.path).toBe(path.join("/tmp/uploads", "docs", "uuid-2-uuid-2-uuid-2-uuid-2.txt"));
    expect(result.size).toBe(3);
  });

  it("headOwnedPublicUrl retorna metadados para arquivo existente sob public/", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "media-local-head-"));
    const rel = "public/phase1/pixel.txt";
    const full = path.join(root, rel);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, "abc", "utf8");

    const svc = new LocalMediaStorageService({
      rootDir: root,
      publicBasePath: "/uploads",
      publicOrigin: "http://127.0.0.1:3000",
      publicKeyPrefix: "public",
    });

    const url = "http://127.0.0.1:3000/uploads/public/phase1/pixel.txt";
    const meta = await svc.headOwnedPublicUrl(url);

    expect(meta).toEqual({
      contentType: "text/plain",
      contentLength: 3,
    });
  });
});
