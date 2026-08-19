import { SequelizeInstitutionalContentRepository } from "@/modules/institutional-content/infra/sequelize/sequelize-institutional-content.repository";
import { UpdateInstitutionalContentController } from "../../controllers/update-institutional-content.controller";
import { UpdateInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/update-institutional-content.usecase";

export function makeUpdateInstitutionalContentController() {
  const repo = new SequelizeInstitutionalContentRepository();
  const usecase = new UpdateInstitutionalContentUseCase(repo);
  return new UpdateInstitutionalContentController(usecase);
}
