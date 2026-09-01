import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "img",
];
const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "style"];

/** Sanitiza o HTML vindo do editor rico antes de persistir (única fonte de HTML gerado por usuário no sistema). */
export function sanitizeBlogPostHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
