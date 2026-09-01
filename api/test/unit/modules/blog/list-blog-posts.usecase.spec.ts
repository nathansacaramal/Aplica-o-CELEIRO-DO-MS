import { ListBlogPostsUseCase } from "@/modules/blog/application/use-cases/list-blog-posts.usecase";
import { ListBlogPostsRepository } from "@/modules/blog/domain/repositories/list-blog-posts.repository";
import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";

const postRow = new BlogPostEntity({
  id: 1,
  titulo: "P",
  slug: "p",
  resumo: "R",
  conteudo: "<p>C</p>",
  imagemDestaque: "https://x.com/i.jpg",
  status: "published",
  dataPublicacao: new Date(),
});

describe("ListBlogPostsUseCase", () => {
  const list = jest.fn();
  const repo: Pick<ListBlogPostsRepository, "list"> = { list };
  const sut = new ListBlogPostsUseCase(repo as ListBlogPostsRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue({
      items: [postRow],
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      sort: { by: "dataPublicacao", dir: "desc" },
    });
  });

  it("normaliza page, limit e sort e chama o repositório", async () => {
    const out = await sut.execute({
      page: "2",
      limit: "5",
      sortBy: "titulo",
      sortDir: "ASC",
      titulo: "fest",
      status: "draft",
    });
    expect(list).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      filters: { titulo: "fest", status: "draft", onlyPublished: undefined },
      sort: { by: "titulo", dir: "asc" },
    });
    expect(out.items).toHaveLength(1);
    expect(out.total).toBe(25);
    expect(out.totalPages).toBe(5);
  });

  it("usa defaults quando page/limit inválidos", async () => {
    await sut.execute({ page: -1, limit: 0 });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
  });

  it("repassa onlyPublished para o repositório (uso público)", async () => {
    await sut.execute({ onlyPublished: true });
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.objectContaining({ onlyPublished: true }) }),
    );
  });
});
