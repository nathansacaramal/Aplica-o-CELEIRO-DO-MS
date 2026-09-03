import { GenerateUniqueBlogSlugService } from "@/modules/blog/application/services/generate-unique-blog-slug.service";
import { FindBlogPostBySlugAnyStatusRepository } from "@/modules/blog/domain/repositories/find-blog-post-by-slug-any-status.repository";
import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";

const makeExisting = () =>
  new BlogPostEntity({
    id: 1,
    titulo: "Festival de Inverno",
    slug: "festival-de-inverno",
    resumo: "R",
    conteudo: "<p>C</p>",
    imagemDestaque: "https://x.com/i.jpg",
    galeria: [],
    status: "published",
    dataPublicacao: new Date(),
  });

describe("GenerateUniqueBlogSlugService", () => {
  it("gera slug simples quando não há colisão", async () => {
    const findBySlugAnyStatus = jest.fn().mockResolvedValue(null);
    const repo: FindBlogPostBySlugAnyStatusRepository = { findBySlugAnyStatus };
    const sut = new GenerateUniqueBlogSlugService(repo);

    const slug = await sut.generate("Festival de Inverno movimenta Nova Andradina");

    expect(slug).toBe("festival-de-inverno-movimenta-nova-andradina");
    expect(findBySlugAnyStatus).toHaveBeenCalledTimes(1);
  });

  it("sufixa -2 quando o slug base já existe", async () => {
    const findBySlugAnyStatus = jest
      .fn()
      .mockResolvedValueOnce(makeExisting())
      .mockResolvedValueOnce(null);
    const repo: FindBlogPostBySlugAnyStatusRepository = { findBySlugAnyStatus };
    const sut = new GenerateUniqueBlogSlugService(repo);

    const slug = await sut.generate("Festival de Inverno");

    expect(slug).toBe("festival-de-inverno-2");
    expect(findBySlugAnyStatus).toHaveBeenNthCalledWith(1, "festival-de-inverno");
    expect(findBySlugAnyStatus).toHaveBeenNthCalledWith(2, "festival-de-inverno-2");
  });

  it("continua sufixando até achar um slug livre", async () => {
    const findBySlugAnyStatus = jest
      .fn()
      .mockResolvedValueOnce(makeExisting())
      .mockResolvedValueOnce(makeExisting())
      .mockResolvedValueOnce(null);
    const repo: FindBlogPostBySlugAnyStatusRepository = { findBySlugAnyStatus };
    const sut = new GenerateUniqueBlogSlugService(repo);

    const slug = await sut.generate("Festival de Inverno");

    expect(slug).toBe("festival-de-inverno-3");
  });

  it("usa 'publicacao' como base quando o título não gera nenhum caractere válido", async () => {
    const findBySlugAnyStatus = jest.fn().mockResolvedValue(null);
    const repo: FindBlogPostBySlugAnyStatusRepository = { findBySlugAnyStatus };
    const sut = new GenerateUniqueBlogSlugService(repo);

    const slug = await sut.generate("???");

    expect(slug).toBe("publicacao");
  });
});
