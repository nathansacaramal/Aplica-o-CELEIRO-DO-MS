import { GetEventByIdUseCase } from "@/modules/events/application/use-cases/get-event-by-id.usecase";
import { SequelizeEventRepository } from "@/modules/events/infra/repositories/sequelize-event.repository";
import { GetEventByIdController } from "../controllers/get-event-by-id.controller";

export function makeGetEventByIdController() {
  const repo = new SequelizeEventRepository();
  const useCase = new GetEventByIdUseCase(repo);
  return new GetEventByIdController(useCase);
}
