import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { TouristPointEntity } from "../../domain/entities/tourist-point.entity";
import { CreateTouristPointRepository } from "../../domain/repositories/create-tourist-point.repository";
import { createTouristPointDTO, TouristPointPersistedDTO } from "../dto";

export class CreateTouristPointUseCase {
  constructor(
    private readonly repository: CreateTouristPointRepository,
    private readonly images: PublicWebImageUploader,
  ) {}

  async execute(touristPointDTO: createTouristPointDTO): Promise<TouristPointPersistedDTO> {
    const { image, ...fields } = touristPointDTO;
    const { url: imageUrl } = await this.images.uploadPublicWebImage(image, "tourist-points");

    const input: TouristPointEntity = new TouristPointEntity({
      ...fields,
      imageUrl,
    });
    const touristPoint = await this.repository.create(input);
    return {
      id: touristPoint.id!,
      cityId: touristPoint.cityId,
      citySlug: touristPoint.citySlug,
      name: touristPoint.name,
      description: touristPoint.description,
      category: touristPoint.category,
      address: touristPoint.address,
      openingHours: touristPoint.openingHours,
      imageUrl: touristPoint.imageUrl,
      featured: touristPoint.featured,
      published: touristPoint.published,
    };
  }
}
