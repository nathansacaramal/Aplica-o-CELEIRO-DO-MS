import { blogPostModelToEntity } from "@/modules/blog/infra/mappers/blog-post-model.mapper";
import BlogPostModel from "@/modules/blog/infra/model/blog-post-model";

describe("blogPostModelToEntity", () => {
  it("mapeia status válido", () => {
    const m = {
      id: 1,
      titulo: "P",
      slug: "p",
      resumo: "R",
      conteudo: "<p>C</p>",
      imagemDestaque: "https://x.com/i.jpg",
      status: "published",
      dataPublicacao: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as BlogPostModel;
    const e = blogPostModelToEntity(m);
    expect(e.status).toBe("published");
    expect(e.id).toBe(1);
  });

  it("fallback para 'draft' quando status inválido no banco", () => {
    const m = {
      id: 1,
      titulo: "P",
      slug: "p",
      resumo: "R",
      conteudo: "<p>C</p>",
      imagemDestaque: "https://x.com/i.jpg",
      status: "???",
      dataPublicacao: new Date(),
    } as unknown as BlogPostModel;
    const e = blogPostModelToEntity(m);
    expect(e.status).toBe("draft");
  });
});
