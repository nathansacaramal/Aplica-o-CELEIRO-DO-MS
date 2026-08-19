// src/modules/events/domain/repositories/list-events.repository.ts
import { EventEntity } from "../entities/event.entity";

export type SortDir = "asc" | "desc";

export interface ListEventsFilters {
  name?: string;
  category?: string;
  cityId?: number;
}

export interface ListSort {
  by?: string;
  dir?: SortDir;
}

export interface ListEventsQuery {
  page?: number;
  limit?: number;
  filters?: ListEventsFilters;
  sort?: ListSort;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort: { by: string; dir: SortDir };
}

export interface ListEventsRepository {
  list(query: ListEventsQuery): Promise<PaginatedResult<EventEntity>>;
}
