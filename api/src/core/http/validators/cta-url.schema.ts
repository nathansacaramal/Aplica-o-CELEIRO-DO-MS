import { z } from "zod";

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * CTA do site: URL absoluta (https://...) ou caminho de SPA (`/eventos`, `/cidades/1`).
 */
export const ctaUrlSchema = z
  .string()
  .min(1, "Informe para onde o botão deve levar")
  .refine(
    (v) => v.startsWith("/") || isAbsoluteHttpUrl(v),
    "Informe um endereço válido (https://...) ou um caminho do site começando com / (ex.: /eventos, /pontos-turisticos)",
  );
