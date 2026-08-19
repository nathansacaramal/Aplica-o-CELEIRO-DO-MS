import { InstitutionalContentEntity } from "../../domain/entities/institutional-content.entity";
import { GetInstitutionalContentRepository } from "../../domain/repositories/get-institutional-content.repository";

export class GetInstitutionalContentUseCase {
  constructor(private readonly repo: GetInstitutionalContentRepository) {}

  async execute(): Promise<InstitutionalContentEntity[] | null> {
    return this.repo.getAll();
  }
}
