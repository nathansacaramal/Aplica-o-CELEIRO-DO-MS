import { AppError } from "@/core/errors-app-error";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { TouristPointProps } from "../../domain/entities/tourist-point.entity";
import { FindTouristPointByIdRepository } from "../../domain/repositories";
import { UpdateTouristPointRepository } from "../../domain/repositories/update-tourist-point.repository";
import { TouristPointPersistedDTO, updateTouristPointDTO } from "../dto";

export class UpdateTouristPointUseCase {
  constructor(
    private readonly findById: FindTouristPointByIdRepository,
    private readonly repository: UpdateTouristPointRepository,
    private readonly images: PublicWebImageUploader,
  ) {}

  async execute(id: number, input: updateTouristPointDTO): Promise<TouristPointPersistedDTO> {
    const existing = await this.findById.findById(id);
    if (!existing) {
      throw new AppError({
        code: "PONTO_TURISTICO_NOT_FOUND",
        message: "Ponto turístico não encontrado",
        statusCode: 404,
      });
    }

    const { image, ...rest } = input;
    const data: Partial<TouristPointProps> = { ...rest };
    if (image) {
      const { url } = await this.images.replacePublicWebImage(
        existing.imageUrl,
        image,
        "tourist-points",
      );
      data.imageUrl = url;
    }

    const touristPoint = await this.repository.update(id, data);
    if (!touristPoint) {
      throw new AppError({
        code: "PONTO_TURISTICO_NOT_FOUND",
        message: "Ponto turístico não encontrado",
        statusCode: 404,
      });
    }
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
