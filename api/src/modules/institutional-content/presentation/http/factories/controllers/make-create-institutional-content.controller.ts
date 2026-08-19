import { CreateInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/create-institutional-content.usecase";
import { SequelizeInstitutionalContentRepository } from "@/modules/institutional-content/infra/sequelize/sequelize-institutional-content.repository";
import { CreateInstitutionalContentController } from "../../controllers/create-institutional-content.controller";

export function makeCreateInstitutionalContentController() {
  const repo = new SequelizeInstitutionalContentRepository();
  const usecase = new CreateInstitutionalContentUseCase(repo);
  return new CreateInstitutionalContentController(usecase);
}
