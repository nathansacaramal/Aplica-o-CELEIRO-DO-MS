import { InstitutionalContentEntity } from "../../domain/entities/institutional-content.entity";
import { UpdateInstitutionalContentRepository } from "../../domain/repositories/update-institutional-content.repository";
import { UpdateInstitutionalContentDTO } from "../dto";

export class UpdateInstitutionalContentUseCase {
  constructor(private readonly repo: UpdateInstitutionalContentRepository) {}

  async execute(
    id: number,
    patch: UpdateInstitutionalContentDTO,
  ): Promise<InstitutionalContentEntity | null> {
    return this.repo.update(id, patch);
  }
}
