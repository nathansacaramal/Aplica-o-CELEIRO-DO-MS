import { UpdateBlogPostUseCase } from "@/modules/blog/application/use-cases/update-blog-post.usecase";
import type { UpdateBlogPostDTO } from "@/modules/blog/application/dto";
import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";
import type { FindBlogPostByIdRepository } from "@/modules/blog/domain/repositories/find-blog-post-by-id.repository";
import type { UpdateBlogPostRepository } from "@/modules/blog/domain/repositories/update-blog-post.repository";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const makeExisting = (overrides: Partial<BlogPostEntity["props"]> = {}) =>
  new BlogPostEntity({
    id: 3,
    titulo: "Fest",
    slug: "fest",
    resumo: "R",
    conteudo: "<p>C</p>",
    imagemDestaque: "https://cdn/old.jpg",
    galeria: [],
    status: "draft",
    dataPublicacao: new Date("2026-01-01"),
    ...overrides,
  });

describe("UpdateBlogPostUseCase", () => {
  const makeSut = (existing: BlogPostEntity) => {
    const findByIdRepo: FindBlogPostByIdRepository = {
      findById: jest.fn(async (id: number) => (id === 3 ? existing : null)),
    };
    const updateRepo: UpdateBlogPostRepository = {
      update: jest.fn(async (_id, data) => new BlogPostEntity({ ...existing.props, ...data })),
    };
    const images: PublicWebImageUploader = {
      uploadPublicWebImage: jest.fn(),
      replacePublicWebImage: jest.fn().mockResolvedValue({ url: "https://cdn/new.jpg" }),
    };
    const sut = new UpdateBlogPostUseCase(findByIdRepo, updateRepo, images);
    return { sut, findByIdRepo, updateRepo, images };
  };

  it("lança BLOG_POST_NOT_FOUND quando a publicação não existe", async () => {
    const { sut } = makeSut(makeExisting());
    await expect(sut.execute(99, { titulo: "X" })).rejects.toMatchObject({
      code: "BLOG_POST_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("não recalcula o slug mesmo quando o título muda", async () => {
    const { sut, updateRepo } = makeSut(makeExisting());
    await sut.execute(3, { titulo: "Novo título" });
    expect(updateRepo.update).toHaveBeenCalledWith(
      3,
      expect.not.objectContaining({ slug: expect.anything() }),
    );
  });

  it("sanitiza conteúdo e re-deriva o resumo quando conteudo muda", async () => {
    const { sut, updateRepo } = makeSut(makeExisting());
    await sut.execute(3, { conteudo: "<p>Novo</p><script>alert(1)</script>" });
    expect(updateRepo.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ conteudo: "<p>Novo</p>", resumo: "Novo" }),
    );
  });

  it("define dataPublicacao ao publicar pela primeira vez sem data explícita", async () => {
    const { sut, updateRepo } = makeSut(makeExisting({ status: "draft" }));
    await sut.execute(3, { status: "published" });
    const call = (updateRepo.update as jest.Mock).mock.calls[0]![1];
    expect(call.status).toBe("published");
    expect(call.dataPublicacao).toBeInstanceOf(Date);
  });

  it("não sobrescreve dataPublicacao se já estava publicado", async () => {
    const { sut, updateRepo } = makeSut(makeExisting({ status: "published" }));
    await sut.execute(3, { status: "published" });
    const call = (updateRepo.update as jest.Mock).mock.calls[0]![1];
    expect(call.dataPublicacao).toBeUndefined();
  });

  it("respeita dataPublicacao explícita ao publicar", async () => {
    const explicitDate = new Date("2026-03-01");
    const { sut, updateRepo } = makeSut(makeExisting({ status: "draft" }));
    await sut.execute(3, { status: "published", dataPublicacao: explicitDate });
    const call = (updateRepo.update as jest.Mock).mock.calls[0]![1];
    expect(call.dataPublicacao).toBe(explicitDate);
  });

  it("substitui a imagem quando uma nova é enviada", async () => {
    const { sut, images, updateRepo } = makeSut(makeExisting());
    const image = { base64: tinyPngB64, mimeType: "image/png" as const };

    await sut.execute(3, { image });

    expect(images.replacePublicWebImage).toHaveBeenCalledWith("https://cdn/old.jpg", image, "blog");
    expect(updateRepo.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ imagemDestaque: "https://cdn/new.jpg" }),
    );
  });

  it("mantém a galeria atual quando o campo é omitido", async () => {
    const { sut, updateRepo } = makeSut(makeExisting({ galeria: ["https://cdn/foto.jpg"] }));

    await sut.execute(3, { titulo: "X" });

    const call = (updateRepo.update as jest.Mock).mock.calls[0]![1];
    expect(call.galeria).toBeUndefined();
  });

  it("esvazia a galeria quando o admin envia lista vazia", async () => {
    const { sut, updateRepo } = makeSut(makeExisting({ galeria: ["https://cdn/foto.jpg"] }));

    await sut.execute(3, { galeria: [] });

    expect(updateRepo.update).toHaveBeenCalledWith(3, expect.objectContaining({ galeria: [] }));
  });

  it("envia fotos novas da galeria e preserva as mantidas", async () => {
    const { sut, updateRepo, images } = makeSut(makeExisting());
    (images.uploadPublicWebImage as jest.Mock).mockResolvedValue({ url: "https://cdn/nova.jpg" });
    const image = { base64: tinyPngB64, mimeType: "image/png" as const };

    await sut.execute(3, { galeria: [{ url: "https://cdn/mantida.jpg" }, { image }] });

    expect(images.uploadPublicWebImage).toHaveBeenCalledWith(image, "blog");
    expect(updateRepo.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ galeria: ["https://cdn/mantida.jpg", "https://cdn/nova.jpg"] }),
    );
  });

  it("lança BLOG_POST_UPDATE_FAILED quando update retorna null", async () => {
    const existing = makeExisting();
    const findByIdRepo: FindBlogPostByIdRepository = { findById: jest.fn(async () => existing) };
    const updateRepo: UpdateBlogPostRepository = { update: jest.fn(async () => null) };
    const images: PublicWebImageUploader = {
      uploadPublicWebImage: jest.fn(),
      replacePublicWebImage: jest.fn(),
    };
    const sut = new UpdateBlogPostUseCase(findByIdRepo, updateRepo, images);

    await expect(sut.execute(3, { titulo: "X" })).rejects.toMatchObject({
      code: "BLOG_POST_UPDATE_FAILED",
      statusCode: 500,
    });
  });
});
