import { CityEntity } from "../../domain/entities/city.entity";
import { PublicListCityRepository } from "../../domain/repositories/public-list-city.repository";

export class PublicListCityUsecase {
  constructor(private readonly repo: PublicListCityRepository) {}

  async execute(): Promise<CityEntity[] | null> {
    return await this.repo.publicList();
  }
}
