const EXCERPT_MAX_LENGTH = 220;

/** Remove tags HTML, colapsa espaços e corta em EXCERPT_MAX_LENGTH caracteres (usado como resumo automático). */
export function extractExcerptFromHtml(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

  if (text.length <= EXCERPT_MAX_LENGTH) return text;

  const truncated = text.slice(0, EXCERPT_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  const safeTruncated = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return `${safeTruncated}…`;
}
