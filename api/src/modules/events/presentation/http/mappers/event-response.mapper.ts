import { EventEntity, type EventProps } from "@/modules/events/domain/entities/event.entity";

function eventPropsOf(source: EventEntity | EventProps): EventProps {
  return source instanceof EventEntity ? source.props : source;
}

/** Corpo JSON alinhado ao contrato de eventos (admin e público). */
export function toEventHttpPayload(source: EventEntity | EventProps) {
  const e = eventPropsOf(source);
  return {
    id: e.id,
    cityId: e.cityId,
    citySlug: e.citySlug,
    name: e.name,
    description: e.description,
    category: e.category,
    startDate: e.startDate,
    endDate: e.endDate,
    formattedDate: e.formattedDate,
    location: e.location,
    imageUrl: e.imageUrl,
    featured: e.featured,
    published: e.published,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}
