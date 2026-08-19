// src/modules/events/domain/repositories/delete-event.repository.ts
import { Transaction } from "sequelize";

export interface DeleteEventRepository {
  delete(id: number, t?: Transaction): Promise<boolean>;
}
