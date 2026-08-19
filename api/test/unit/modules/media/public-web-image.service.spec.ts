import { PublicWebImageService } from "@/modules/media/application/services/public-web-image.service";
import * as base64 from "@/modules/media/application/helpers/base64";
import type { WebImageProcessor } from "@/modules/media/domain/services/web-image.processor";
import type { MediaStorageService } from "@/modules/media/domain/services/media-storage.service";
import { DomainLogger } from "@/core/logger/domain-logger";

let mediaStorageMode: "local" | "s3" = "local";

jest.mock("@/core/config/env", () => ({
  ENV: new Proxy({} as { MEDIA_STORAGE: string; S3_STORAGE_CLASS: string }, {
    get(_, prop: string) {
      if (prop === "MEDIA_STORAGE") return mediaStorageMode;
      if (prop === "S3_STORAGE_CLASS") return "STANDARD_IA";
      return undefined;
    },
  }),
}));

describe("PublicWebImageService", () => {
  const tinyPngB64 = Buffer.from([137, 80, 78, 71]).toString("base64");

  const makeSut = () => {
    const processor: jest.Mocked<WebImageProcessor> = {
      process: jest.fn(),
    };
    const storage: jest.Mocked<MediaStorageService> = {
      save: jest.fn(),
      deleteIfOwnedPublicUrl: jest.fn(),
      headOwnedPublicUrl: jest.fn(),
    };
    const logger: DomainLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    const sut = new PublicWebImageService(processor, storage, logger);
    return { sut, processor, storage, logger };
  };

  beforeEach(() => {
    mediaStorageMode = "local";
    jest.restoreAllMocks();
  });

  it("uploadPublicWebImage: processa, salva com pasta normalizada e retorna url", async () => {
    const { sut, processor, storage } = makeSut();
    const processed = Buffer.from("processed");
    processor.process.mockResolvedValue(processed);
    storage.save.mockResolvedValue({
      path: "/p",
      url: "https://cdn.example.com/a.png",
      size: processed.length,
      mimeType: "image/png",
    });

    const result = await sut.uploadPublicWebImage(
      { base64: tinyPngB64, mimeType: "image/png", filename: "  x.png  " },
      "/events/",
    );

    expect(processor.process).toHaveBeenCalledWith(expect.any(Buffer), "image/png");
    expect(storage.save).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "x.png",
        mimeType: "image/png",
        buffer: processed,
        folder: "events",
        visibility: "public",
        storageClass: undefined,
      }),
    );
    expect(result).toEqual({ url: "https://cdn.example.com/a.png" });
  });

  it("usa nome padrão por MIME quando filename ausente", async () => {
    const { sut, processor, storage } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("w"));
    storage.save.mockResolvedValue({
      path: "/w",
      url: "https://x/u.webp",
      size: 1,
      mimeType: "image/webp",
    });

    await sut.uploadPublicWebImage({ base64: tinyPngB64, mimeType: "image/webp" }, "banners");

    expect(storage.save).toHaveBeenCalledWith(expect.objectContaining({ filename: "upload.webp" }));
  });

  it("usa upload.jpg como nome padrão para MIME raster não mapeado", async () => {
    const { sut, processor, storage } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("j"));
    storage.save.mockResolvedValue({
      path: "/j",
      url: "https://x/j.jpg",
      size: 1,
      mimeType: "image/jpeg",
    });

    await sut.uploadPublicWebImage({ base64: tinyPngB64, mimeType: "image/tiff" }, "x");

    expect(storage.save).toHaveBeenCalledWith(expect.objectContaining({ filename: "upload.jpg" }));
  });

  it("com MEDIA_STORAGE s3, repassa S3_STORAGE_CLASS quando storageClass omitido", async () => {
    mediaStorageMode = "s3";
    const { sut, processor, storage } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("p"));
    storage.save.mockResolvedValue({
      path: "/o",
      url: "https://s3/x.jpg",
      size: 1,
      mimeType: "image/jpeg",
    });

    await sut.uploadPublicWebImage({ base64: tinyPngB64, mimeType: "image/jpeg" }, "x");

    expect(storage.save).toHaveBeenCalledWith(
      expect.objectContaining({ storageClass: "STANDARD_IA" }),
    );
  });

  it("storageClass explícito sobrescreve padrão S3", async () => {
    mediaStorageMode = "s3";
    const { sut, processor, storage } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("p"));
    storage.save.mockResolvedValue({
      path: "/o",
      url: "https://s3/x.jpg",
      size: 1,
      mimeType: "image/jpeg",
    });

    await sut.uploadPublicWebImage(
      { base64: tinyPngB64, mimeType: "image/jpeg" },
      "x",
      "GLACIER_IR",
    );

    expect(storage.save).toHaveBeenCalledWith(
      expect.objectContaining({ storageClass: "GLACIER_IR" }),
    );
  });

  it("lança MEDIA_INVALID_BASE64 quando buffer decodificado vazio", async () => {
    jest.spyOn(base64, "decodeBase64PayloadToBuffer").mockReturnValue(Buffer.alloc(0));
    const { sut } = makeSut();
    await expect(
      sut.uploadPublicWebImage({ base64: "AAAA", mimeType: "image/png" }, "f"),
    ).rejects.toMatchObject({
      code: "MEDIA_INVALID_BASE64",
      statusCode: 400,
    });
  });

  it("lança MEDIA_TOO_LARGE quando decode sinaliza File too large", async () => {
    jest.spyOn(base64, "decodeBase64PayloadToBuffer").mockImplementation(() => {
      throw new Error("File too large");
    });
    const { sut } = makeSut();
    await expect(
      sut.uploadPublicWebImage({ base64: "eHk=", mimeType: "image/png" }, "f"),
    ).rejects.toMatchObject({
      code: "MEDIA_TOO_LARGE",
      statusCode: 413,
    });
  });

  it("lança MEDIA_INVALID_BASE64 para erro genérico no decode", async () => {
    jest.spyOn(base64, "decodeBase64PayloadToBuffer").mockImplementation(() => {
      throw new Error("boom");
    });
    const { sut } = makeSut();
    await expect(
      sut.uploadPublicWebImage({ base64: "eHk=", mimeType: "image/png" }, "f"),
    ).rejects.toMatchObject({
      code: "MEDIA_INVALID_BASE64",
      statusCode: 400,
    });
  });

  it("lança MEDIA_PUBLIC_URL_MISSING quando storage não retorna url", async () => {
    const { sut, processor, storage } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("p"));
    storage.save.mockResolvedValue({
      path: "/p",
      url: undefined,
      size: 1,
      mimeType: "image/png",
    });

    await expect(
      sut.uploadPublicWebImage({ base64: tinyPngB64, mimeType: "image/png" }, "f"),
    ).rejects.toMatchObject({
      code: "MEDIA_PUBLIC_URL_MISSING",
      statusCode: 500,
    });
  });

  it("replacePublicWebImage remove URL anterior e faz upload", async () => {
    const { sut, processor, storage } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("n"));
    storage.save.mockResolvedValue({
      path: "/n",
      url: "https://cdn/new.png",
      size: 1,
      mimeType: "image/png",
    });

    const url = await sut.replacePublicWebImage(
      "  https://cdn/old.png  ",
      { base64: tinyPngB64, mimeType: "image/png" },
      "folder",
    );

    expect(storage.deleteIfOwnedPublicUrl).toHaveBeenCalledWith("https://cdn/old.png");
    expect(url).toEqual({ url: "https://cdn/new.png" });
  });

  it("replacePublicWebImage não chama delete quando previous vazio", async () => {
    const { sut, processor, storage } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("n"));
    storage.save.mockResolvedValue({
      path: "/n",
      url: "https://cdn/n.png",
      size: 1,
      mimeType: "image/png",
    });

    await sut.replacePublicWebImage(
      undefined,
      { base64: tinyPngB64, mimeType: "image/png" },
      "folder",
    );

    expect(storage.deleteIfOwnedPublicUrl).not.toHaveBeenCalled();
  });

  it("registra info no logger após upload bem-sucedido", async () => {
    const { sut, processor, storage, logger } = makeSut();
    processor.process.mockResolvedValue(Buffer.from("p"));
    storage.save.mockResolvedValue({
      path: "/p",
      url: "https://u",
      size: 42,
      mimeType: "image/png",
    });

    await sut.uploadPublicWebImage({ base64: tinyPngB64, mimeType: "image/png" }, "banners");

    expect(logger.info).toHaveBeenCalledWith(
      "PublicWebImageService: uploaded",
      expect.objectContaining({ folder: "banners", size: 42 }),
    );
  });
});
