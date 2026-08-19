import path from "path";
import crypto from "crypto";
import fs from "node:fs/promises";
import {
  ensureDir,
  joinFs,
  joinPublicPath,
  normalizeFolder,
  writeBufferFile,
} from "@/core/config/paths";
import {
  MediaHeadResult,
  MediaStorageService,
  SaveMediaInput,
  SaveMediaOutput,
} from "../../domain/services/media-storage.service";
import { resolveUploadExtension } from "./resolve-upload-extension";

function contentTypeFromExtension(ext: string): string {
  const e = ext.toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".json": "application/json",
    ".pdf": "application/pdf",
  };
  return map[e] ?? "application/octet-stream";
}

export interface LocalMediaStorageConfig {
  rootDir: string;
  publicBasePath?: string;
  /** Ex.: http://127.0.0.1:3000 — usado para montar URL pública e validar exclusões. */
  publicOrigin?: string;
  /** Mesmo conceito do S3: pasta lógica sob uploads, ex. "public". */
  publicKeyPrefix?: string;
}

export class LocalMediaStorageService implements MediaStorageService {
  constructor(private readonly cfg: LocalMediaStorageConfig) {}

  private prefixedFolder(input: SaveMediaInput): string {
    const isPublic = input.visibility === "public";
    const prefix = (this.cfg.publicKeyPrefix ?? "public").replace(/^\/+|\/+$/g, "");
    const folder = normalizeFolder(input.folder);
    if (!isPublic) return folder;
    return folder ? `${prefix}/${folder}` : prefix;
  }

  async save(input: SaveMediaInput): Promise<SaveMediaOutput> {
    const ext = resolveUploadExtension(input.filename, input.mimeType);
    const safeName = `${crypto.randomUUID()}${ext}`;

    const relFolder = this.prefixedFolder(input);
    const dir = joinFs(this.cfg.rootDir, relFolder);

    await ensureDir(dir);

    const filePath = path.join(dir, safeName);
    await writeBufferFile(filePath, input.buffer);

    const logicalPath = this.cfg.publicBasePath
      ? joinPublicPath(this.cfg.publicBasePath, relFolder, safeName)
      : filePath;

    const origin = this.cfg.publicOrigin?.replace(/\/+$/, "");
    const url = input.visibility === "public" && origin ? `${origin}${logicalPath}` : undefined;

    return {
      path: logicalPath,
      url,
      size: input.buffer.length,
      mimeType: input.mimeType,
    };
  }

  async deleteIfOwnedPublicUrl(url: string): Promise<void> {
    const origin = this.cfg.publicOrigin?.replace(/\/+$/, "");
    const basePath = this.cfg.publicBasePath;
    if (!origin || !basePath) return;

    const trimmed = url.trim();
    if (!trimmed.startsWith(origin)) return;

    const afterOrigin = trimmed.slice(origin.length);
    if (!afterOrigin.startsWith(basePath)) return;

    const relativeFromUploads = afterOrigin.slice(basePath.length).replace(/^\//, "");
    if (!relativeFromUploads) return;

    const abs = path.join(this.cfg.rootDir, relativeFromUploads);
    const rootResolved = path.resolve(this.cfg.rootDir);
    const fileResolved = path.resolve(abs);
    if (!fileResolved.startsWith(rootResolved)) return;

    try {
      await fs.unlink(fileResolved);
    } catch {
      /* já removido ou inexistente */
    }
  }

  async headOwnedPublicUrl(url: string): Promise<MediaHeadResult | null> {
    const origin = this.cfg.publicOrigin?.replace(/\/+$/, "");
    const basePath = this.cfg.publicBasePath;
    if (!origin || !basePath) return null;

    const trimmed = url.trim();
    if (!trimmed.startsWith(origin)) return null;

    const afterOrigin = trimmed.slice(origin.length);
    if (!afterOrigin.startsWith(basePath)) return null;

    const relativeFromRoot = afterOrigin.slice(basePath.length).replace(/^\//, "");
    if (!relativeFromRoot) return null;

    const prefix = (this.cfg.publicKeyPrefix ?? "public").replace(/^\/+|\/+$/g, "");
    if (relativeFromRoot !== prefix && !relativeFromRoot.startsWith(`${prefix}/`)) {
      return null;
    }

    const abs = path.join(this.cfg.rootDir, relativeFromRoot);
    const rootResolved = path.resolve(this.cfg.rootDir);
    const fileResolved = path.resolve(abs);
    if (!fileResolved.startsWith(rootResolved)) return null;

    try {
      const st = await fs.stat(fileResolved);
      if (!st.isFile()) return null;
      return {
        contentType: contentTypeFromExtension(path.extname(fileResolved)),
        contentLength: st.size,
      };
    } catch {
      return null;
    }
  }
}
