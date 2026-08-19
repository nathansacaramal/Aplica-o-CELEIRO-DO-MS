// src/modules/events/infra/repositories/sequelize-event.repository.ts
import { Transaction } from "sequelize";
import EventModel from "../model/event-model";
import { EventEntity } from "../../domain/entities/event.entity";
import { CreateEventRepository } from "../../domain/repositories/create-event.repository";
import { DeleteEventRepository } from "../../domain/repositories/delete-event.repository";
import { FindEventByIdRepository } from "../../domain/repositories/find-event-by-id.repository";
import {
  ListEventsRepository,
  ListEventsQuery,
  PaginatedResult,
} from "../../domain/repositories/list-events.repository";
import { UpdateEventRepository } from "../../domain/repositories/update-event.repository";

import { SpecificationBuilder } from "@/core/domain/specification/specification-builder";
import { eq, like } from "@/core/domain/specification/builders";
import { eventModelToEntity } from "../mappers/event-model.mapper";

const ALLOWED_SORT_FIELDS = new Set([
  "id",
  "cityId",
  "citySlug",
  "name",
  "description",
  "category",
  "startDate",
  "endDate",
  "formattedDate",
  "location",
  "imageUrl",
  "featured",
  "published",
  "createdAt",
  "updatedAt",
]);

export class SequelizeEventRepository
  implements
    CreateEventRepository,
    FindEventByIdRepository,
    ListEventsRepository,
    UpdateEventRepository,
    DeleteEventRepository
{
  async create(event: EventEntity, t?: Transaction): Promise<EventEntity> {
    const created = await EventModel.create(
      {
        cityId: event.cityId,
        citySlug: event.citySlug,
        name: event.name,
        description: event.description,
        category: event.category,
        startDate: event.startDate,
        endDate: event.endDate,
        formattedDate: event.formattedDate,
        location: event.location,
        imageUrl: event.imageUrl,
        featured: event.featured,
        published: event.published,
      },
      { transaction: t },
    );

    return eventModelToEntity(created);
  }

  async findById(id: number): Promise<EventEntity | null> {
    const found = await EventModel.findByPk(id);
    return found ? eventModelToEntity(found) : null;
  }

  async update(
    id: number,
    data: Partial<EventEntity["props"]>,
    t?: Transaction,
  ): Promise<EventEntity | null> {
    const found = await EventModel.findByPk(id);
    if (!found) return null;

    await found.update(
      {
        cityId: data.cityId ?? found.cityId,
        citySlug: data.citySlug ?? found.citySlug,
        name: data.name ?? found.name,
        description: data.description ?? found.description,
        category: data.category ?? found.category,
        startDate: data.startDate ?? found.startDate,
        endDate: data.endDate ?? found.endDate,
        formattedDate: data.formattedDate ?? found.formattedDate,
        location: data.location ?? found.location,
        imageUrl: data.imageUrl ?? found.imageUrl,
        featured: data.featured ?? found.featured,
        published: data.published ?? found.published,
      },
      { transaction: t },
    );

    return eventModelToEntity(found);
  }

  async delete(id: number, t?: Transaction): Promise<boolean> {
    const deleted = await EventModel.destroy({ where: { id }, transaction: t });
    return deleted > 0;
  }

  async list(query: ListEventsQuery): Promise<PaginatedResult<EventEntity>> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const offset = (page - 1) * limit;

    const sortByRaw = query.sort?.by;
    const sortDirRaw = query.sort?.dir;

    const sortBy = ALLOWED_SORT_FIELDS.has(String(sortByRaw)) ? String(sortByRaw) : "createdAt";

    const sortDir = (String(sortDirRaw ?? "desc").toLowerCase() === "asc" ? "asc" : "desc") as
      | "asc"
      | "desc";

    const filters = query.filters ?? {};
    const cityId = filters.cityId !== undefined ? Number(filters.cityId) : undefined;

    const builder = new SpecificationBuilder<typeof filters>()
      .add((p) => (p.name ? like("name", p.name) : null))
      .add((p) => (p.category ? eq("category", p.category) : null))
      .add((_p) => (typeof cityId === "number" ? eq("cityId", cityId) : null));

    const spec = builder.build({ ...filters, cityId });

    const where = spec ? spec.toSequelizeWhere() : {};

    const { rows, count } = await EventModel.findAndCountAll({
      where,
      order: [[sortBy, sortDir]],
      limit,
      offset,
    });

    const total = typeof count === "number" ? count : 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items: rows.map((r) => eventModelToEntity(r)),
      page,
      limit,
      total,
      totalPages,
      sort: { by: sortBy, dir: sortDir },
    };
  }
}
