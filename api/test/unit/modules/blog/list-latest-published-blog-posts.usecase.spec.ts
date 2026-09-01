import { ListLatestPublishedBlogPostsUseCase } from "@/modules/blog/application/use-cases/list-latest-published-blog-posts.usecase";
import { ListLatestPublishedBlogPostsRepository } from "@/modules/blog/domain/repositories/list-latest-published-blog-posts.repository";
import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";

const makePost = (id: number) =>
  new BlogPostEntity({
    id,
    titulo: `P${id}`,
    slug: `p${id}`,
    resumo: "R",
    conteudo: "<p>C</p>",
    imagemDestaque: "https://x.com/i.jpg",
    status: "published",
    dataPublicacao: new Date(),
  });

describe("ListLatestPublishedBlogPostsUseCase", () => {
  it("usa limite padrão de 12", async () => {
    const listLatestPublished = jest.fn().mockResolvedValue([makePost(1)]);
    const repo: ListLatestPublishedBlogPostsRepository = { listLatestPublished };
    const sut = new ListLatestPublishedBlogPostsUseCase(repo);

    await sut.execute();

    expect(listLatestPublished).toHaveBeenCalledWith(12);
  });

  it("nunca ultrapassa 12 mesmo se um limite maior for pedido", async () => {
    const listLatestPublished = jest.fn().mockResolvedValue([]);
    const repo: ListLatestPublishedBlogPostsRepository = { listLatestPublished };
    const sut = new ListLatestPublishedBlogPostsUseCase(repo);

    await sut.execute(50);

    expect(listLatestPublished).toHaveBeenCalledWith(12);
  });

  it("usa pelo menos 1 quando limite inválido é passado", async () => {
    const listLatestPublished = jest.fn().mockResolvedValue([]);
    const repo: ListLatestPublishedBlogPostsRepository = { listLatestPublished };
    const sut = new ListLatestPublishedBlogPostsUseCase(repo);

    await sut.execute(0);

    expect(listLatestPublished).toHaveBeenCalledWith(1);
  });
});
