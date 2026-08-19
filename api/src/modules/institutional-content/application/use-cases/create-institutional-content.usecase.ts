import { InstitutionalContentEntity } from "../../domain/entities/institutional-content.entity";
import { CreateInstitutionalContentRepository } from "../../domain/repositories/create-institutional-content.repository";

export class CreateInstitutionalContentUseCase {
  constructor(private readonly repo: CreateInstitutionalContentRepository) {}

  async execute(entity: InstitutionalContentEntity): Promise<InstitutionalContentEntity | null> {
    return this.repo.create(entity);
  }
}
