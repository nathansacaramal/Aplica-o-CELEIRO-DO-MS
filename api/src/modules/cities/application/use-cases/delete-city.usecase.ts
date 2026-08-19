import { DeleteCityRepository } from "../../domain/repositories/delete-city.repository";

export class DeleteCityUseCase {
  constructor(private deleteCityRepository: DeleteCityRepository) {}

  async execute(id: number): Promise<boolean> {
    return await this.deleteCityRepository.delete(id);
  }
}
