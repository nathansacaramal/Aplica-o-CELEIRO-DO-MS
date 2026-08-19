import { SharpWebImageProcessor } from "@/modules/media/infra/image/sharp-web-image.processor";

const toBuffer = jest.fn().mockResolvedValue(Buffer.from("out"));

const chain = {
  rotate: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  png: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  gif: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toBuffer,
};

jest.mock("sharp", () => jest.fn(() => chain));

import sharp from "sharp";

const cfg = {
  maxWidth: 800,
  maxHeight: 600,
  lossyQuality: 77,
};

describe("SharpWebImageProcessor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    toBuffer.mockResolvedValue(Buffer.from("out"));
  });

  it("monta pipeline com rotate, resize e PNG para image/png", async () => {
    const sut = new SharpWebImageProcessor(cfg);
    const input = Buffer.from("in");
    await sut.process(input, "image/png");

    expect(sharp).toHaveBeenCalledWith(input);
    expect(chain.rotate).toHaveBeenCalled();
    expect(chain.resize).toHaveBeenCalledWith(800, 600, {
      fit: "inside",
      withoutEnlargement: true,
    });
    expect(chain.png).toHaveBeenCalledWith({ compressionLevel: 9 });
    expect(toBuffer).toHaveBeenCalled();
  });

  it("usa WebP com qualidade configurada", async () => {
    const sut = new SharpWebImageProcessor(cfg);
    await sut.process(Buffer.from("x"), "  image/webp  ");

    expect(chain.webp).toHaveBeenCalledWith({ quality: 77 });
    expect(chain.jpeg).not.toHaveBeenCalled();
  });

  it("usa GIF para image/gif", async () => {
    const sut = new SharpWebImageProcessor(cfg);
    await sut.process(Buffer.from("x"), "image/gif");

    expect(chain.gif).toHaveBeenCalled();
  });

  it("trata JPEG, JPG e demais como JPEG (mozjpeg)", async () => {
    const sut = new SharpWebImageProcessor(cfg);
    await sut.process(Buffer.from("a"), "image/jpeg");
    expect(chain.jpeg).toHaveBeenCalledWith({
      quality: 77,
      mozjpeg: true,
    });

    jest.clearAllMocks();
    toBuffer.mockResolvedValue(Buffer.from("b"));
    await sut.process(Buffer.from("b"), "image/jpg");
    expect(chain.jpeg).toHaveBeenCalled();

    jest.clearAllMocks();
    toBuffer.mockResolvedValue(Buffer.from("c"));
    await sut.process(Buffer.from("c"), "image/avif");
    expect(chain.jpeg).toHaveBeenCalled();
  });

  it("retorna o buffer produzido por toBuffer", async () => {
    const out = Buffer.from([1, 2, 3]);
    toBuffer.mockResolvedValue(out);
    const sut = new SharpWebImageProcessor(cfg);
    const result = await sut.process(Buffer.from("x"), "image/png");
    expect(result.equals(out)).toBe(true);
  });
});
