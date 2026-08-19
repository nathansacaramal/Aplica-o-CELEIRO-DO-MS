import crypto from "crypto";

/** Remove prefixo `...;base64,` de data URLs; retorna o payload bruto caso não haja prefixo. */
export function stripBase64DataUrlPrefix(input: string): string {
  const idx = input.indexOf("base64,");
  return idx >= 0 ? input.slice(idx + "base64,".length) : input;
}

const DEFAULT_MAX_DECODED_BYTES = 10 * 1024 * 1024;

/**
 * Decodifica string base64 (com ou sem data URL) para buffer, com limite de tamanho.
 * Não valida charset base64 estrito (adequado após validação na borda, ex. Zod).
 */
export function decodeBase64PayloadToBuffer(
  input: string,
  maxBytes: number = DEFAULT_MAX_DECODED_BYTES,
): Buffer {
  const raw = stripBase64DataUrlPrefix(input.trim());
  const buffer = Buffer.from(raw, "base64");
  if (buffer.byteLength > maxBytes) {
    throw new Error("File too large");
  }
  return buffer;
}

export function parseBase64(input: string) {
  const dataUrlMatch = input.match(/^data:(.+);base64,(.*)$/);

  const contentType = dataUrlMatch?.[1];
  const base64 = stripBase64DataUrlPrefix(input.trim());

  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
    throw new Error("Invalid base64 payload");
  }

  const buffer = Buffer.from(base64, "base64");

  if (buffer.byteLength > DEFAULT_MAX_DECODED_BYTES) {
    throw new Error("File too large");
  }

  const hash = crypto.createHash("sha1").update(buffer).digest("hex");
  return { buffer, contentType, hash };
}

export function normalizeToArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
