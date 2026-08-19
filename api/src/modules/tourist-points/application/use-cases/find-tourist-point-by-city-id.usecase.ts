import { TouristPointEntity } from "../../domain/entities/tourist-point.entity";
import { SequelizeTouristPointRepository } from "../../infra/sequelize/sequelize-tourist-point.repository";

export class FindTouristPointByCityIdUseCase {
  constructor(private readonly repository: SequelizeTouristPointRepository) {}

  async execute(cityId: number): Promise<TouristPointEntity[] | null> {
    return await this.repository.findByCityId(cityId);
  }
}
