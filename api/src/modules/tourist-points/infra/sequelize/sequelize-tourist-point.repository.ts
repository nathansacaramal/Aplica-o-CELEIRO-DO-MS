import { Transaction } from "sequelize";
import { TouristPointEntity, TouristPointProps } from "../../domain/entities/tourist-point.entity";
import {
  CreateTouristPointRepository,
  DeleteTouristPointRepository,
  FindTouristPointByCityRepository,
  FindTouristPointByIdRepository,
  ListTouristPointsSpecificationRepository,
  UpdateTouristPointRepository,
} from "../../domain/repositories";
import { QuerySpecification } from "../../domain/specifications/query-specification";
import TouristPointModel from "../model/tourist-point-model";

export class SequelizeTouristPointRepository
  implements
    CreateTouristPointRepository,
    DeleteTouristPointRepository,
    FindTouristPointByCityRepository,
    FindTouristPointByIdRepository,
    UpdateTouristPointRepository,
    ListTouristPointsSpecificationRepository
{
  constructor() {}

  listSpec(params: {
    spec?: QuerySpecification | null;
    limit: number;
    offset: number;
    order: [string, "ASC" | "DESC"][];
  }): Promise<{ rows: any[]; count: number }> {
    const where = params.spec?.toWhere?.() ?? {};

    return TouristPointModel.findAndCountAll({
      where,
      limit: params.limit,
      offset: params.offset,
      order: params.order,
    });
  }

  async create(data: TouristPointEntity, t?: Transaction): Promise<TouristPointEntity> {
    const created = await TouristPointModel.create(
      {
        cityId: data.cityId,
        citySlug: data.citySlug,
        name: data.name,
        description: data.description ?? null,
        category: data.category ?? null,
        address: data.address ?? null,
        openingHours: data.openingHours ?? null,
        imageUrl: data.imageUrl,
        featured: data.featured, // ✅ obrigatório pela model
        published: data.published,
      },
      { transaction: t },
    );

    return new TouristPointEntity({
      id: created.id,
      cityId: created.cityId,
      citySlug: created.citySlug,
      name: created.name,
      description: created.description,
      category: created.category,
      address: created.address,
      openingHours: created.openingHours,
      imageUrl: created.imageUrl,
      featured: created.featured,
      published: created.published,
    });
  }

  async findById(id: number): Promise<TouristPointEntity | null> {
    const point = await TouristPointModel.findByPk(id);
    if (!point) return null;

    return new TouristPointEntity({
      id: point.id,
      cityId: point.cityId,
      citySlug: point.citySlug,
      name: point.name,
      description: point.description,
      category: point.category,
      address: point.address,
      openingHours: point.openingHours,
      imageUrl: point.imageUrl,
      featured: point.featured, // ✅ obrigatório pela model
      published: point.published,
    });
  }

  async findByCityId(cityId: number): Promise<TouristPointEntity[] | null> {
    const points = await TouristPointModel.findAll({ where: { cityId } });

    return points.map(
      (p) =>
        new TouristPointEntity({
          id: p.id,
          cityId: p.cityId,
          citySlug: p.citySlug,
          name: p.name,
          description: p.description,
          category: p.category,
          address: p.address,
          openingHours: p.openingHours,
          imageUrl: p.imageUrl,
          featured: p.featured, // ✅ obrigatório pela model
          published: p.published,
        }),
    );
  }

  async update(
    id: number,
    data: Partial<TouristPointProps>,
    t?: Transaction,
  ): Promise<TouristPointEntity | null> {
    const [affected] = await TouristPointModel.update(
      {
        cityId: data.cityId,
        citySlug: data.citySlug,
        name: data.name,
        description: data.description,
        category: data.category,
        address: data.address,
        openingHours: data.openingHours,
        imageUrl: data.imageUrl,
        featured: data.featured, // ✅ obrigatório pela model
        published: data.published,
      },
      { where: { id }, transaction: t },
    );

    if (affected === 0) return null;
    return this.findById(id);
  }

  async delete(id: number, t?: Transaction): Promise<boolean> {
    const deleted = await TouristPointModel.destroy({
      where: { id },
      transaction: t,
    });
    return deleted > 0;
  }
}
