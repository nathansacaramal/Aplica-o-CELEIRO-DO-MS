import { FindInstitutionalContentByIdUseCase } from "@/modules/institutional-content/application/use-cases/find-institutional-content-by-id.usecase";
import { SequelizeInstitutionalContentRepository } from "@/modules/institutional-content/infra/sequelize/sequelize-institutional-content.repository";
import {
  FindInstitutionalContentByIdController,
  InstitutionalContentByIdAudience,
} from "../../controllers/find-institutional-content-by-id.controller";

export function makeFindInstitutionalContentByIdController(
  audience: InstitutionalContentByIdAudience = "admin",
) {
  const repo = new SequelizeInstitutionalContentRepository();
  const usecase = new FindInstitutionalContentByIdUseCase(repo);
  return new FindInstitutionalContentByIdController(usecase, audience);
}
