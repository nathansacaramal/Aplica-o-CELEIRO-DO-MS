import {
  blogPostLatestLinks,
  blogPostLinks,
  blogPostListLinks,
  blogPostPublicBySlugLinks,
  blogPostPublicLinks,
  blogPostPublicListLinks,
} from "@/modules/blog/presentation/http/blog-post-hateoas";

describe("blog-post-hateoas", () => {
  it("blogPostPublicLinks e blogPostLinks", () => {
    const pub = blogPostPublicLinks(5);
    expect(pub["self"]!.href).toContain("/api/public/blog/by-id/5");
    expect(blogPostLinks(5).update?.method).toBe("PATCH");
    expect(blogPostLinks(5).delete?.method).toBe("DELETE");
  });

  it("blogPostPublicBySlugLinks", () => {
    const links = blogPostPublicBySlugLinks("festival-de-inverno");
    expect(links.self!.href).toBe("/api/public/blog/festival-de-inverno");
  });

  it("blogPostLatestLinks aponta para /public/blog/latest", () => {
    expect(blogPostLatestLinks().self!.href).toBe("/api/public/blog/latest");
  });

  it("blogPostListLinks com paginação e filtros", () => {
    const links = blogPostListLinks({
      page: 2,
      limit: 10,
      totalPages: 5,
      filters: { titulo: "x", status: "draft" },
      sort: { by: "titulo", dir: "desc" },
    });
    expect(links.self!.href).toContain("page=2");
    expect(links.next).toBeDefined();
    expect(links.prev).toBeDefined();
  });

  it("primeira página sem prev; última sem next", () => {
    const first = blogPostListLinks({ page: 1, limit: 10, totalPages: 3 });
    expect(first.prev).toBeUndefined();
    expect(first.next).toBeDefined();

    const last = blogPostListLinks({ page: 3, limit: 10, totalPages: 3 });
    expect(last.next).toBeUndefined();
    expect(last.prev).toBeDefined();
  });

  it("blogPostPublicListLinks usa base pública", () => {
    const links = blogPostPublicListLinks({ page: 1, limit: 5, totalPages: 1 });
    expect(links.self!.href).toContain("/api/public/blog");
  });
});
