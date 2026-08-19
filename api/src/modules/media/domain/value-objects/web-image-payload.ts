/**
 * Entrada mínima para upload de imagem pública (base64 + tipo MIME).
 * Usada na porta de aplicação; validação detalhada fica na borda HTTP (Zod).
 */
export type WebImagePayload = {
  base64: string;
  mimeType: string;
  filename?: string;
};
