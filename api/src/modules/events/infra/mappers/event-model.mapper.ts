import { EventEntity } from "../../domain/entities/event.entity";
import { EventCategory, isEventCategory } from "../../domain/value-objects/event-category";
import EventModel from "../model/event-model";

export function eventModelToEntity(m: EventModel): EventEntity {
  const category: EventCategory = isEventCategory(m.category) ? m.category : "show";
  return new EventEntity({
    id: m.id,
    cityId: m.cityId,
    citySlug: m.citySlug,
    name: m.name,
    description: m.description,
    category,
    startDate: m.startDate,
    endDate: m.endDate,
    formattedDate: m.formattedDate,
    location: m.location,
    imageUrl: m.imageUrl,
    featured: m.featured,
    published: m.published,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  });
}
