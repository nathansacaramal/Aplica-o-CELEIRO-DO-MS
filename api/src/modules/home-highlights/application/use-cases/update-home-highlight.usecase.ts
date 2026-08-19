import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { HomeHighlightEntity } from "../../domain/entities/home-highlight.entity";
import { FindHomeHighlightByIdRepository } from "../../domain/repositories/find-home-highlight-by-id.repository";
import { UpdateHomeHighlightRepository } from "../../domain/repositories/update-home-highlight.repository";
import { UpdateHomeHighlightDTO } from "../dto";

export class UpdateHomeHighlightUseCase {
  constructor(
    private readonly findByIdRepo: FindHomeHighlightByIdRepository,
    private readonly updateRepo: UpdateHomeHighlightRepository,
    private readonly images: PublicWebImageUploader,
  ) {}

  async execute(id: number, patch: UpdateHomeHighlightDTO): Promise<HomeHighlightEntity | null> {
    const existing = await this.findByIdRepo.findById(id);
    if (!existing) return null;

    const { image, ...rest } = patch;
    let imageUrl = existing.imageUrl;
    if (image) {
      const { url } = await this.images.replacePublicWebImage(
        existing.imageUrl,
        image,
        "home-highlights",
      );
      imageUrl = url;
    }

    const entity = new HomeHighlightEntity({
      id,
      type: rest.type ?? existing.type,
      referenceId: rest.referenceId ?? existing.referenceId,
      title: rest.title ?? existing.title,
      description: rest.description ?? existing.description,
      cityName: rest.cityName ?? existing.cityName,
      imageUrl,
      ctaUrl: rest.ctaUrl ?? existing.ctaUrl,
      active: rest.active ?? existing.active,
      order: rest.order ?? existing.order,
    });
    return await this.updateRepo.update(id, entity);
  }
}
