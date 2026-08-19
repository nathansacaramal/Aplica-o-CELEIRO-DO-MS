// src/modules/events/domain/repositories/find-event-by-id.repository.ts
import { EventEntity } from "../entities/event.entity";

export interface FindEventByIdRepository {
  findById(id: number): Promise<EventEntity | null>;
}
