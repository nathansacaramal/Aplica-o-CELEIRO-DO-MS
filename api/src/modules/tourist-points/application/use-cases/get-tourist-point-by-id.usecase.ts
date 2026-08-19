import { AppError } from "@/core/errors-app-error";
import { TouristPointEntity } from "../../domain/entities/tourist-point.entity";
import { FindTouristPointByIdRepository } from "../../domain/repositories/find-tourist-point-by-id.repository";

export class GetTouristPointByIdUseCase {
  constructor(private readonly repository: FindTouristPointByIdRepository) {}

  async execute(id: number): Promise<TouristPointEntity> {
    const found = await this.repository.findById(id);
    if (!found?.id) {
      throw new AppError({
        code: "TOURIST_POINT_NOT_FOUND",
        message: "Ponto turístico não encontrado",
        statusCode: 404,
        details: { id },
      });
    }
    return found;
  }
}
