import { CreateBlogPostController } from "@/modules/blog/presentation/http/controllers/create-blog-post.controller";
import { DeleteBlogPostController } from "@/modules/blog/presentation/http/controllers/delete-blog-post.controller";
import { GetBlogPostByIdController } from "@/modules/blog/presentation/http/controllers/get-blog-post-by-id.controller";
import { FindBlogPostBySlugController } from "@/modules/blog/presentation/http/controllers/find-blog-post-by-slug.controller";
import { UpdateBlogPostController } from "@/modules/blog/presentation/http/controllers/update-blog-post.controller";
import { ListLatestPublishedBlogPostsController } from "@/modules/blog/presentation/http/controllers/list-latest-published-blog-posts.controller";
import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const entity = new BlogPostEntity({
  id: 7,
  titulo: "Fest",
  slug: "fest",
  resumo: "R",
  conteudo: "<p>C</p>",
  imagemDestaque: "https://x.com/e.jpg",
  galeria: [],
  status: "published",
  dataPublicacao: new Date(),
});

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const createDto = {
  titulo: "Fest",
  conteudo: "<p>Conteúdo do post aqui</p>",
  status: "published" as const,
  image: { base64: tinyPngB64, mimeType: "image/png" as const },
};

describe("CreateBlogPostController", () => {
  const execute = jest.fn();
  const sut = new CreateBlogPostController({ execute } as never);

  it("201 e erro", async () => {
    execute.mockResolvedValue(entity);
    const r = await sut.handle({ correlationId: "c", body: createDto });
    expect(r.statusCode).toBe(201);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", body: createDto })).statusCode).not.toBe(201);
  });
});

describe("GetBlogPostByIdController", () => {
  const execute = jest.fn();
  const sut = new GetBlogPostByIdController({ execute } as never);

  it("200 e erro", async () => {
    execute.mockResolvedValue(entity);
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).toBe(200);
    execute.mockRejectedValue(new Error("nf"));
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).not.toBe(200);
  });
});

describe("FindBlogPostBySlugController", () => {
  const execute = jest.fn();
  const sut = new FindBlogPostBySlugController({ execute } as never);

  it("200 quando encontrado", async () => {
    execute.mockResolvedValue(entity);
    const r = await sut.handle({ correlationId: "c", params: { slug: "fest" } });
    expect(r.statusCode).toBe(200);
  });

  it("404 quando não encontrado", async () => {
    execute.mockResolvedValue(null);
    const r = await sut.handle({ correlationId: "c", params: { slug: "inexistente" } });
    expect(r.statusCode).toBe(404);
    expect(r.body).toMatchObject({ error: { code: "BLOG_POST_NOT_FOUND" } });
  });
});

describe("DeleteBlogPostController", () => {
  const execute = jest.fn();
  const sut = new DeleteBlogPostController({ execute } as never);

  it("204 e erro", async () => {
    execute.mockResolvedValue(undefined);
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).toBe(204);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).not.toBe(204);
  });
});

describe("UpdateBlogPostController", () => {
  const execute = jest.fn();
  const sut = new UpdateBlogPostController({ execute } as never);

  it("200 e erro", async () => {
    execute.mockResolvedValue(entity);
    const r = await sut.handle({ correlationId: "c", params: { id: "7" }, body: { status: "draft" } });
    expect(r.statusCode).toBe(200);
    execute.mockRejectedValue(new Error("x"));
    expect(
      (await sut.handle({ correlationId: "c", params: { id: "7" }, body: {} })).statusCode,
    ).not.toBe(200);
  });
});

describe("ListLatestPublishedBlogPostsController", () => {
  const execute = jest.fn();
  const sut = new ListLatestPublishedBlogPostsController({ execute } as never);

  it("200 com a coleção de posts", async () => {
    execute.mockResolvedValue([entity]);
    const r = await sut.handle({ correlationId: "c", query: {} });
    expect(r.statusCode).toBe(200);
  });

  it("propaga erro do use-case", async () => {
    execute.mockRejectedValue(new Error("x"));
    const r = await sut.handle({ correlationId: "c", query: {} });
    expect(r.statusCode).not.toBe(200);
  });
});
