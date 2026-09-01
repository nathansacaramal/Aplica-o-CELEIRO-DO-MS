import { sanitizeBlogPostHtml } from "@/modules/blog/application/services/sanitize-html.service";

describe("sanitizeBlogPostHtml", () => {
  it("remove tags <script> e handlers inline", () => {
    const dirty = '<p>Olá</p><script>alert(1)</script><img src="x.jpg" onerror="alert(2)" />';
    const clean = sanitizeBlogPostHtml(dirty);

    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("<p>Olá</p>");
  });

  it("mantém tags permitidas (listas, links, citação)", () => {
    const html =
      '<h2>Título</h2><ul><li>Item</li></ul><blockquote>Cita</blockquote><a href="https://x.com">link</a>';
    const clean = sanitizeBlogPostHtml(html);

    expect(clean).toContain("<h2>Título</h2>");
    expect(clean).toContain("<ul><li>Item</li></ul>");
    expect(clean).toContain("<blockquote>Cita</blockquote>");
    expect(clean).toContain('href="https://x.com"');
  });
});
