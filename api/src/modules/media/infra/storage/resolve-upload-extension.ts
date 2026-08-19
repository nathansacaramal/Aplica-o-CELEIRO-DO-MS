import path from "node:path";

/**
 * Extensão do arquivo salvo (com ponto), a partir do nome original ou do MIME.
 */
export function resolveUploadExtension(filename: string | undefined, mimeType: string): string {
  const fromName = path.extname(filename ?? "").toLowerCase();
  if (fromName && /^\.[a-z0-9]{1,15}$/i.test(fromName)) {
    return fromName;
  }

  const m = mimeType.trim().toLowerCase();
  if (m === "image/jpeg" || m === "image/jpg") return ".jpg";
  if (m === "image/png") return ".png";
  if (m === "image/webp") return ".webp";
  if (m === "image/gif") return ".gif";
  if (m === "text/plain") return ".txt";

  return ".bin";
}
