import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { CityEntity, CityProps } from "../../domain/entities/city.entity";
import { EditCityRepository } from "../../domain/repositories/edit-city.repository";
import { FindCityByIdRepository } from "../../domain/repositories/find-city-by-id.repository";
import { UpdateCityDTO } from "../dto";

export class UpdateCityUseCase {
  constructor(
    private readonly editCityRepository: EditCityRepository,
    private readonly findCityByIdRepository: FindCityByIdRepository,
    private readonly images: PublicWebImageUploader,
  ) {}

  async execute(id: number, dto: UpdateCityDTO): Promise<CityEntity | null> {
    const existing = await this.findCityByIdRepository.findById(id);
    if (!existing) return null;

    const { image, ...rest } = dto;
    const payload: Partial<CityProps> = { ...rest };

    if (image) {
      const { url } = await this.images.replacePublicWebImage(existing.imageUrl, image, "cities");
      payload.imageUrl = url;
    }

    return await this.editCityRepository.edit(id, payload as Partial<CityEntity>);
  }
}
