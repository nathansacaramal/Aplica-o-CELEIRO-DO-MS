import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";
import { toBlogPostHttpPayload } from "@/modules/blog/presentation/http/mappers/blog-post-response.mapper";

describe("toBlogPostHttpPayload", () => {
  const props = {
    id: 1,
    titulo: "Festival",
    slug: "festival",
    resumo: "Resumo",
    conteudo: "<p>Conteúdo</p>",
    imagemDestaque: "https://x.com/i.jpg",
    status: "published" as const,
    dataPublicacao: new Date("2026-01-01"),
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-03"),
  };

  it("aceita BlogPostEntity (instanceof)", () => {
    const entity = new BlogPostEntity(props);
    const out = toBlogPostHttpPayload(entity);
    expect(out.id).toBe(1);
    expect(out.titulo).toBe("Festival");
    expect(out.status).toBe("published");
    expect(out.createdAt).toEqual(props.createdAt);
  });

  it("aceita objeto BlogPostProps plain", () => {
    const out = toBlogPostHttpPayload(props);
    expect(out).toMatchObject({ id: 1, slug: "festival", resumo: "Resumo" });
  });
});
