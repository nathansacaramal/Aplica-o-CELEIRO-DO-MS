import { CityEntity } from "../../domain/entities/city.entity";
import { ListCityRepository } from "../../domain/repositories/list-city.repository";

export class ListCityUseCase {
  constructor(private listCityRepository: ListCityRepository) {}

  async execute(): Promise<CityEntity[]> {
    return await this.listCityRepository.list();
  }
}
