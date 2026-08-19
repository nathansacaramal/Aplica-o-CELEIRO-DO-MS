import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { HomeHighlightEntity } from "../../domain/entities/home-highlight.entity";
import { CreateHomeHighlightRepository } from "../../domain/repositories/create-home-highlight.repository";
import { CreateHomeHighlightDTO } from "../dto";

export class CreateHomeHighlightUseCase {
  constructor(
    private readonly repo: CreateHomeHighlightRepository,
    private readonly images: PublicWebImageUploader,
  ) {}

  async execute(dto: CreateHomeHighlightDTO): Promise<HomeHighlightEntity | null> {
    const { image, ...rest } = dto;
    const { url: imageUrl } = await this.images.uploadPublicWebImage(image, "home-highlights");
    return await this.repo.create({ ...rest, imageUrl });
  }
}
