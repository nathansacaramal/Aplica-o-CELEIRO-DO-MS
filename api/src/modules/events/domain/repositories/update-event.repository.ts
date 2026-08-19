// src/modules/events/domain/repositories/update-event.repository.ts
import { Transaction } from "sequelize";
import { EventEntity } from "../entities/event.entity";

export interface UpdateEventRepository {
  update(
    id: number,
    data: Partial<EventEntity["props"]>,
    t?: Transaction,
  ): Promise<EventEntity | null>;
}
