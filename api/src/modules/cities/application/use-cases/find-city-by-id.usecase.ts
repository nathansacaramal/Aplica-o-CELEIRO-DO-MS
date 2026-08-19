import { AppError } from "@/core/errors-app-error";
import { CityEntity } from "../../domain/entities/city.entity";
import { FindCityByIdRepository } from "../../domain/repositories/find-city-by-id.repository";

export class FindCityByIdUseCase {
  constructor(private findCityByIdRepository: FindCityByIdRepository) {}

  async execute(id: number): Promise<CityEntity> {
    const city = await this.findCityByIdRepository.findById(id);
    if (!city) {
      throw new AppError({
        code: "CIDADE_NOT_FOUND",
        message: `Cidade ${id} não encontrada`,
        statusCode: 404,
        details: { id },
      });
    }
    return city;
  }
}
