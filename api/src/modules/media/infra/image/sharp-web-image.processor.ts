import sharp from "sharp";
import { WebImageProcessor } from "../../domain/services/web-image.processor";

export type SharpWebImageConfig = {
  maxWidth: number;
  maxHeight: number;
  /** Qualidade para JPEG e WebP (1–100). */
  lossyQuality: number;
};

export class SharpWebImageProcessor implements WebImageProcessor {
  constructor(private readonly cfg: SharpWebImageConfig) {}

  async process(buffer: Buffer, sourceMimeType: string): Promise<Buffer> {
    const mime = sourceMimeType.trim().toLowerCase();

    const pipeline = sharp(buffer).rotate().resize(this.cfg.maxWidth, this.cfg.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

    if (mime === "image/png") {
      return pipeline.png({ compressionLevel: 9 }).toBuffer();
    }

    if (mime === "image/webp") {
      return pipeline.webp({ quality: this.cfg.lossyQuality }).toBuffer();
    }

    if (mime === "image/gif") {
      return pipeline.gif().toBuffer();
    }

    // image/jpeg, image/jpg e demais raster tratados como JPEG
    return pipeline.jpeg({ quality: this.cfg.lossyQuality, mozjpeg: true }).toBuffer();
  }
}
