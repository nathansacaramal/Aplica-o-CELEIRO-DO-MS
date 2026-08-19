import { z } from "zod";
import {
  createEventSchema,
  updateEventSchema,
} from "../../presentation/http/validators/event-schemas";
import { EventCategory } from "../../domain/value-objects/event-category";

export type CreateEventDTO = z.infer<typeof createEventSchema>;
export type UpdateEventDTO = z.infer<typeof updateEventSchema>;

export type ListEventsDTO = {
  page?: number | string;
  limit?: number | string;

  name?: string;
  category?: EventCategory;
  cityId?: number | string;

  sortBy?: string;
  sortDir?: "asc" | "desc" | string;
};

export type ListEventsResult = {
  items: Array<{
    id: number;
    cityId: number;
    citySlug: string;
    name: string;
    description: string;
    category: EventCategory;
    startDate: Date;
    endDate: Date;
    formattedDate: string;
    location: string;
    imageUrl: string;
    featured: boolean;
    published: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort?: { by: string; dir: "asc" | "desc" };
};
