// Mesmo algoritmo usado em src/domains/admin-cms/utils/slugify.ts (frontend) e na migration
// 20260821000000-add-slug-to-events-and-tourist-points.cjs: normaliza acentos, minúsculas, kebab-case.
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
