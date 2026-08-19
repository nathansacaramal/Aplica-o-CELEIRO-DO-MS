import { Transaction } from "sequelize";
import { CityEntity } from "../../domain/entities/city.entity";
import {
  CreateCityRepository,
  DeleteCityRepository,
  EditCityRepository,
  FindCityByIdRepository,
  FindCityByNameRepository,
  FindCityBySlugRepository,
  ListCityRepository,
  PublicListCityRepository,
} from "../../domain/repositories";
import { cityModelToEntity } from "../mappers/city-model.mapper";
import { CityModel } from "../models/city-model";

export class SequelizeCityRepository
  implements
    CreateCityRepository,
    ListCityRepository,
    FindCityByIdRepository,
    EditCityRepository,
    DeleteCityRepository,
    FindCityByNameRepository,
    FindCityBySlugRepository,
    PublicListCityRepository
{
  constructor() {}
  async publicFindBySlug(slug: string): Promise<CityEntity | null> {
    const city = await CityModel.findOne({
      where: { slug, published: true },
    });
    if (!city) return null;
    return cityModelToEntity(city);
  }
  async publicList(): Promise<CityEntity[] | null> {
    const cities = await CityModel.findAll({
      where: { published: true },
      order: [["name", "ASC"]],
    });
    return cities.map((city) => cityModelToEntity(city));
  }
  async findByName(name: string): Promise<CityEntity | null> {
    const city = await CityModel.findOne({ where: { name } });
    if (!city) return null;
    return cityModelToEntity(city);
  }

  async create(city: CityEntity, t?: Transaction): Promise<CityEntity> {
    const created = await CityModel.create(
      {
        name: city.name,
        slug: city.slug,
        state: city.state,
        summary: city.summary,
        description: city.description,
        imageUrl: city.imageUrl,
        published: city.published,
      },
      { transaction: t },
    );
    await CityModel.sync();
    return cityModelToEntity(created);
  }

  async list(): Promise<CityEntity[]> {
    const cities = await CityModel.findAll();
    return cities.map((city) => cityModelToEntity(city));
  }

  async findById(id: number): Promise<CityEntity | null> {
    const city = await CityModel.findByPk(id);
    if (!city) return null;

    return cityModelToEntity(city);
  }

  async edit(id: number, city: Partial<CityEntity>, t?: Transaction): Promise<CityEntity | null> {
    const cityUpdated = await CityModel.update(city, {
      where: { id },
      transaction: t,
    });
    await CityModel.sync();
    if (cityUpdated[0] === 0) return null;
    return this.findById(id);
  }

  async delete(id: number, t?: Transaction): Promise<boolean> {
    const deleted = await CityModel.destroy({
      where: { id },
      transaction: t,
    });
    await CityModel.sync();
    return deleted > 0;
  }
}
