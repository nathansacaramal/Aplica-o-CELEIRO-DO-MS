// src/modules/events/domain/repositories/create-event.repository.ts
import { Transaction } from "sequelize";
import { EventEntity } from "../entities/event.entity";

export interface CreateEventRepository {
  create(event: EventEntity, t?: Transaction): Promise<EventEntity>;
}
