import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import {
  MediaHeadResult,
  MediaStorageService,
  SaveMediaInput,
  SaveMediaOutput,
} from "../../domain/services/media-storage.service";
import { resolveUploadExtension } from "./resolve-upload-extension";

export interface S3MediaStorageConfig {
  bucket: string;
  region: string;
  publicBaseUrl: string;
  /** Prefixo das chaves públicas, ex. "public" → public/cities/uuid.png */
  publicKeyPrefix: string;
  defaultStorageClass: string;
}

export class S3MediaStorageService implements MediaStorageService {
  private readonly client: S3Client;

  constructor(private readonly cfg: S3MediaStorageConfig) {
    this.client = new S3Client({ region: cfg.region });
  }

  private buildObjectKey(folder: string | undefined, fileName: string): string {
    const prefix = this.cfg.publicKeyPrefix.replace(/^\/+|\/+$/g, "");
    const sub = folder?.replace(/^\/+|\/+$/g, "") ?? "";
    const parts = [prefix, sub, fileName].filter((p) => p.length > 0);
    return parts.join("/");
  }

  private normalizeBaseUrl(): string {
    return this.cfg.publicBaseUrl.replace(/\/+$/, "");
  }

  private normalizedPublicPrefix(): string {
    return this.cfg.publicKeyPrefix.replace(/^\/+|\/+$/g, "");
  }

  private keyOwnedByPublicPrefix(key: string): boolean {
    const p = this.normalizedPublicPrefix();
    return key === p || key.startsWith(`${p}/`);
  }

  async save(input: SaveMediaInput): Promise<SaveMediaOutput> {
    const ext = resolveUploadExtension(input.filename, input.mimeType);
    const safeName = `${crypto.randomUUID()}${ext}`;

    const folder = input.folder?.replace(/^\//, "") ?? "";
    const key = this.buildObjectKey(folder || undefined, safeName);

    const isPublic = input.visibility === "public";

    const storageClass = (input.storageClass ??
      this.cfg.defaultStorageClass) as PutObjectCommandInput["StorageClass"];

    const objCommand: PutObjectCommandInput = {
      Bucket: this.cfg.bucket,
      Key: key,
      Body: input.buffer,
      ContentType: input.mimeType,
      CacheControl: "public, max-age=31536000, immutable",
      StorageClass: storageClass,
    };

    await this.client.send(new PutObjectCommand(objCommand));

    const url = isPublic ? `${this.normalizeBaseUrl()}/${key}` : undefined;

    return {
      path: `s3://${this.cfg.bucket}/${key}`,
      url,
      size: input.buffer.length,
      mimeType: input.mimeType,
    };
  }

  async deleteIfOwnedPublicUrl(url: string): Promise<void> {
    const base = this.normalizeBaseUrl();
    const trimmed = url.trim();
    if (!trimmed.startsWith(base)) return;

    const key = trimmed.slice(base.length).replace(/^\//, "");
    if (!key) return;

    await this.client.send(new DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: key }));
  }

  async headOwnedPublicUrl(url: string): Promise<MediaHeadResult | null> {
    const base = this.normalizeBaseUrl();
    const trimmed = url.trim();
    if (!trimmed.startsWith(base)) return null;

    const key = trimmed.slice(base.length).replace(/^\//, "");
    if (!key || !this.keyOwnedByPublicPrefix(key)) return null;

    try {
      const out = await this.client.send(
        new HeadObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
      );
      return {
        contentType: out.ContentType ?? "application/octet-stream",
        contentLength: Number(out.ContentLength ?? 0),
      };
    } catch (err: unknown) {
      const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status === 404) return null;
      throw err;
    }
  }
}
