import { SequelizeTouristPointRepository } from "../../infra/sequelize/sequelize-tourist-point.repository";

export class DeleteTouristPointUseCase {
  constructor(private readonly repository: SequelizeTouristPointRepository) {}

  async execute(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
