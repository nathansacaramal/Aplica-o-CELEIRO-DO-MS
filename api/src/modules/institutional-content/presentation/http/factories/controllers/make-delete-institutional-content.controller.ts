import { DeleteInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/delete-institutional-content.usecase";
import { DeleteInstitutionalContentController } from "../../controllers/delete-institutional-content.controller";
import { SequelizeInstitutionalContentRepository } from "@/modules/institutional-content/infra/sequelize/sequelize-institutional-content.repository";

export function makeDeleteInstitutionalContentController() {
  const repo = new SequelizeInstitutionalContentRepository();
  const usecase = new DeleteInstitutionalContentUseCase(repo);
  return new DeleteInstitutionalContentController(usecase);
}
