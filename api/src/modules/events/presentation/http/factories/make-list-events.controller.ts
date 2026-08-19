// src/modules/events/presentation/http/factories/make-list-events.controller.ts
import { EventsListAudience, ListEventsController } from "../controllers/list-events.controller";
import { ListEventsUseCase } from "@/modules/events/application/use-cases/list-events.usecase";
import { SequelizeEventRepository } from "@/modules/events/infra/repositories/sequelize-event.repository";

export function makeListEventsController(audience: EventsListAudience = "admin") {
  const repo = new SequelizeEventRepository();
  const useCase = new ListEventsUseCase(repo);
  return new ListEventsController(useCase, audience);
}
