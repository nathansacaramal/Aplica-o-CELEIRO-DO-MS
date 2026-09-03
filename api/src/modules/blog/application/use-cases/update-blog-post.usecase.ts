import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { BlogPostEntity, BlogPostProps } from "../../domain/entities/blog-post.entity";
import { FindBlogPostByIdRepository } from "../../domain/repositories/find-blog-post-by-id.repository";
import { UpdateBlogPostRepository } from "../../domain/repositories/update-blog-post.repository";
import { UpdateBlogPostDTO } from "../dto";
import { extractExcerptFromHtml } from "../services/extract-excerpt-from-html.service";
import { resolveGallery } from "../services/resolve-gallery.service";
import { sanitizeBlogPostHtml } from "../services/sanitize-html.service";

export class UpdateBlogPostUseCase {
  constructor(
    private readonly findByIdRepo: FindBlogPostByIdRepository,
    private readonly updateRepo: UpdateBlogPostRepository,
    private readonly images: PublicWebImageUploader,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(id: number, dto: UpdateBlogPostDTO): Promise<BlogPostEntity> {
    const existing = await this.findByIdRepo.findById(id);
    if (!existing) {
      throw new AppError({
        code: "BLOG_POST_NOT_FOUND",
        message: `Publicação ${id} não encontrada`,
        statusCode: 404,
        details: { id },
      });
    }

    const { image, conteudo, status, galeria, ...rest } = dto;
    const payload: Partial<BlogPostProps> = { ...rest };

    // O admin manda sempre a lista final (o que fica + o que entra), então
    // omitir o campo mantém a galeria atual e mandar [] esvazia de propósito.
    if (galeria !== undefined) {
      payload.galeria = await resolveGallery(galeria, this.images);
    }

    if (conteudo !== undefined) {
      const sanitized = sanitizeBlogPostHtml(conteudo);
      payload.conteudo = sanitized;
      payload.resumo = extractExcerptFromHtml(sanitized);
    }

    if (status !== undefined) {
      payload.status = status;
      if (status === "published" && existing.status !== "published" && !dto.dataPublicacao) {
        payload.dataPublicacao = new Date();
      }
    }

    if (image) {
      const { url } = await this.images.replacePublicWebImage(existing.imagemDestaque, image, "blog");
      payload.imagemDestaque = url;
    }

    const updated = await this.updateRepo.update(id, payload);
    if (!updated) {
      throw new AppError({
        code: "BLOG_POST_UPDATE_FAILED",
        message: `Falha ao atualizar publicação ${id}`,
        statusCode: 500,
        details: { id },
      });
    }

    this.logger.info("UpdateBlogPostUseCase:success", { id });
    return updated;
  }
}
