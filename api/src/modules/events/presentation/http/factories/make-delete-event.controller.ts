// src/modules/events/presentation/http/factories/make-delete-event.controller.ts
import { SequelizeEventRepository } from "@/modules/events/infra/repositories/sequelize-event.repository";
import { DeleteEventUseCase } from "@/modules/events/application/use-cases/delete-event.usecase";
import { DeleteEventController } from "../controllers/delete-event.controller";

export function makeDeleteEventController() {
  const repo = new SequelizeEventRepository();
  const useCase = new DeleteEventUseCase(repo, repo);
  return new DeleteEventController(useCase);
}
