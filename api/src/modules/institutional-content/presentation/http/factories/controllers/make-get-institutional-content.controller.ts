import { GetInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/get-institutional-content.usecase";
import { SequelizeInstitutionalContentRepository } from "@/modules/institutional-content/infra/sequelize/sequelize-institutional-content.repository";
import {
  GetInstitutionalContentController,
  InstitutionalContentListAudience,
} from "../../controllers/get-institutional-content.controller";

export function makeGetInstitutionalContentController(
  audience: InstitutionalContentListAudience = "admin",
) {
  const repo = new SequelizeInstitutionalContentRepository();
  const usecase = new GetInstitutionalContentUseCase(repo);
  return new GetInstitutionalContentController(usecase, audience);
}
