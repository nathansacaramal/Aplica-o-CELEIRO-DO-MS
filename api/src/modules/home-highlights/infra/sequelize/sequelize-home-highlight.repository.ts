import {
  HomeHighlightEntity,
  HomeHighlightProps,
} from "../../domain/entities/home-highlight.entity";
import { CreateHomeHighlightRepository } from "../../domain/repositories/create-home-highlight.repository";
import { DeleteHomeHighlightRepository } from "../../domain/repositories/delete-home-highlight.repository";
import { FindHomeHighlightByIdRepository } from "../../domain/repositories/find-home-highlight-by-id.repository";
import { GetHomeHighlightRepository } from "../../domain/repositories/get-home-highlight.repository";
import { UpdateHomeHighlightRepository } from "../../domain/repositories/update-home-highlight.repository";
import HomeHighLightsModel from "../model/home-highlights-model";

export class SequelizeHomeHighlightRepository
  implements
    CreateHomeHighlightRepository,
    UpdateHomeHighlightRepository,
    DeleteHomeHighlightRepository,
    FindHomeHighlightByIdRepository,
    GetHomeHighlightRepository
{
  async create(
    __homeHighlight: Omit<HomeHighlightProps, "id">,
  ): Promise<HomeHighlightEntity | null> {
    const result = await HomeHighLightsModel.create({ ...__homeHighlight });
    if (!result) return null;
    return new HomeHighlightEntity({
      id: result.id,
      type: result.type,
      referenceId: result.referenceId,
      title: result.title,
      description: result.description,
      cityName: result.cityName,
      imageUrl: result.imageUrl,
      ctaUrl: result.ctaUrl,
      active: result.active,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }
  async update(
    id: number,
    __homeHighlight: Partial<HomeHighlightEntity>,
  ): Promise<HomeHighlightEntity | null> {
    const found = await HomeHighLightsModel.findByPk(id);
    if (!found) return null;
    const result = await found.update({
      id: __homeHighlight.id ?? found.id,
      type: __homeHighlight.type ?? found.type,
      referenceId: __homeHighlight.referenceId ?? found.referenceId,
      title: __homeHighlight.title ?? found.title,
      description: __homeHighlight.description ?? found.description,
      cityName: __homeHighlight.cityName ?? found.cityName,
      imageUrl: __homeHighlight.imageUrl ?? found.imageUrl,
      ctaUrl: __homeHighlight.ctaUrl ?? found.ctaUrl,
      active: __homeHighlight.active ?? found.active,
      order: __homeHighlight.order ?? found.order,
    });

    return new HomeHighlightEntity({
      id: result.id,
      type: result.type,
      referenceId: result.referenceId,
      title: result.title,
      description: result.description,
      cityName: result.cityName,
      imageUrl: result.imageUrl,
      ctaUrl: result.ctaUrl,
      active: result.active,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }
  async delete(id: number): Promise<boolean> {
    const deleted = await HomeHighLightsModel.destroy({ where: { id } });
    return deleted > 0;
  }
  async findById(id: number): Promise<HomeHighlightEntity | null> {
    const result = await HomeHighLightsModel.findByPk(id);
    if (!result) return null;

    return new HomeHighlightEntity({
      id: result.id,
      type: result.type,
      referenceId: result.referenceId,
      title: result.title,
      description: result.description,
      cityName: result.cityName,
      imageUrl: result.imageUrl,
      ctaUrl: result.ctaUrl,
      active: result.active,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }
  async getAll(): Promise<HomeHighlightEntity[] | null> {
    const result = await HomeHighLightsModel.findAll();

    return result.map(
      (hh) =>
        new HomeHighlightEntity({
          id: hh.id,
          type: hh.type,
          referenceId: hh.referenceId,
          title: hh.title,
          description: hh.description,
          cityName: hh.cityName,
          imageUrl: hh.imageUrl,
          ctaUrl: hh.ctaUrl,
          active: hh.active,
          order: hh.order,
          createdAt: hh.createdAt,
          updatedAt: hh.updatedAt,
        }),
    );
  }
}
