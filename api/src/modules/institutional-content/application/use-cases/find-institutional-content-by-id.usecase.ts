import { InstitutionalContentEntity } from "../../domain/entities/institutional-content.entity";
import { FindInstitutionalContentByIdRepository } from "../../domain/repositories/find-institutional-content-by-id.repository";

export class FindInstitutionalContentByIdUseCase {
  constructor(private readonly repo: FindInstitutionalContentByIdRepository) {}

  async execute(id: number): Promise<InstitutionalContentEntity | null> {
    return this.repo.findById(id);
  }
}
