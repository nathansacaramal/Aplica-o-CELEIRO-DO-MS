import { FindEventBySlugUseCase } from "@/modules/events/application/use-cases/find-event-by-slug.usecase";
import { SequelizeEventRepository } from "@/modules/events/infra/repositories/sequelize-event.repository";
import { FindEventBySlugController } from "../controllers/find-event-by-slug.controller";

export function makeFindEventBySlugController() {
  const repo = new SequelizeEventRepository();
  const useCase = new FindEventBySlugUseCase(repo);
  return new FindEventBySlugController(useCase);
}
