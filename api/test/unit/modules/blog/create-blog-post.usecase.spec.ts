import { CreateBlogPostUseCase } from "@/modules/blog/application/use-cases/create-blog-post.usecase";
import type { CreateBlogPostDTO } from "@/modules/blog/application/dto";
import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";
import { CreateBlogPostRepository } from "@/modules/blog/domain/repositories/create-blog-post.repository";
import { GenerateUniqueBlogSlugService } from "@/modules/blog/application/services/generate-unique-blog-slug.service";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const dto: CreateBlogPostDTO = {
  titulo: "Festival de Inverno",
  conteudo: '<p>Texto</p><script>alert(1)</script>',
  status: "published",
  image: { base64: tinyPngB64, mimeType: "image/png" },
};

const persisted = new BlogPostEntity({
  id: 42,
  titulo: "Festival de Inverno",
  slug: "festival-de-inverno",
  resumo: "Texto",
  conteudo: "<p>Texto</p>",
  imagemDestaque: "https://cdn.example/post.png",
  status: "published",
  dataPublicacao: new Date(),
});

describe("CreateBlogPostUseCase", () => {
  const makeSut = () => {
    const create = jest.fn().mockResolvedValue(persisted);
    const createRepo = { create } as unknown as CreateBlogPostRepository;
    const generateSlug = {
      generate: jest.fn().mockResolvedValue("festival-de-inverno"),
    } as unknown as GenerateUniqueBlogSlugService;
    const images = {
      uploadPublicWebImage: jest.fn().mockResolvedValue({ url: "https://cdn.example/post.png" }),
    } as unknown as PublicWebImageUploader;
    const sut = new CreateBlogPostUseCase(createRepo, generateSlug, images);
    return { sut, create, generateSlug, images };
  };

  it("gera slug a partir do título, sanitiza o conteúdo, deriva o resumo e faz upload da imagem", async () => {
    const { sut, create, generateSlug, images } = makeSut();

    const out = await sut.execute(dto);

    expect(generateSlug.generate).toHaveBeenCalledWith("Festival de Inverno");
    expect(images.uploadPublicWebImage).toHaveBeenCalledWith(dto.image, "blog");
    expect(create).toHaveBeenCalled();

    const arg = create.mock.calls[0]![0] as BlogPostEntity;
    expect(arg.props.slug).toBe("festival-de-inverno");
    expect(arg.props.conteudo).not.toContain("<script>");
    expect(arg.props.resumo).toBe("Texto");
    expect(arg.props.imagemDestaque).toBe("https://cdn.example/post.png");
    expect(out.id).toBe(42);
  });

  it("usa status 'draft' por padrão e preenche dataPublicacao mesmo assim", async () => {
    const { sut, create } = makeSut();
    const { status, ...rest } = dto;
    void status;

    await sut.execute(rest as CreateBlogPostDTO);

    const arg = create.mock.calls[0]![0] as BlogPostEntity;
    expect(arg.props.status).toBe("draft");
    expect(arg.props.dataPublicacao).toBeInstanceOf(Date);
  });

  it("respeita dataPublicacao explícita quando informada", async () => {
    const { sut, create } = makeSut();
    const explicitDate = new Date("2026-01-15T10:00:00Z");

    await sut.execute({ ...dto, dataPublicacao: explicitDate });

    const arg = create.mock.calls[0]![0] as BlogPostEntity;
    expect(arg.props.dataPublicacao).toBe(explicitDate);
  });
});
