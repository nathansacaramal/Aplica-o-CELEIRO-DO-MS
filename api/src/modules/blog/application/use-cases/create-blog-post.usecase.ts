import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { BlogPostEntity } from "../../domain/entities/blog-post.entity";
import { CreateBlogPostRepository } from "../../domain/repositories/create-blog-post.repository";
import { CreateBlogPostDTO } from "../dto";
import { extractExcerptFromHtml } from "../services/extract-excerpt-from-html.service";
import { GenerateUniqueBlogSlugService } from "../services/generate-unique-blog-slug.service";
import { resolveGallery } from "../services/resolve-gallery.service";
import { sanitizeBlogPostHtml } from "../services/sanitize-html.service";

export class CreateBlogPostUseCase {
  constructor(
    private readonly createRepo: CreateBlogPostRepository,
    private readonly generateSlug: GenerateUniqueBlogSlugService,
    private readonly images: PublicWebImageUploader,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(dto: CreateBlogPostDTO): Promise<BlogPostEntity> {
    this.logger.info("CreateBlogPostUseCase:start", { titulo: dto.titulo });

    const slug = await this.generateSlug.generate(dto.titulo);
    const conteudo = sanitizeBlogPostHtml(dto.conteudo);
    const resumo = extractExcerptFromHtml(conteudo);
    const status = dto.status ?? "draft";
    const dataPublicacao = dto.dataPublicacao ?? new Date();

    const { url: imagemDestaque } = await this.images.uploadPublicWebImage(dto.image, "blog");
    const galeria = await resolveGallery(dto.galeria ?? [], this.images);

    const entity = new BlogPostEntity({
      id: 0,
      titulo: dto.titulo,
      slug,
      resumo,
      conteudo,
      imagemDestaque,
      galeria,
      status,
      dataPublicacao,
    });

    const created = await this.createRepo.create(entity);

    this.logger.info("CreateBlogPostUseCase:success", { id: created.id, slug: created.slug });
    return created;
  }
}
