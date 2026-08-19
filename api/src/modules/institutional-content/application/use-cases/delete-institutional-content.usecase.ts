import { DeleteInstitutionalContentRepository } from "../../domain/repositories/delete-institutional-content.repository";

export class DeleteInstitutionalContentUseCase {
  constructor(private readonly repo: DeleteInstitutionalContentRepository) {}

  async execute(id: number): Promise<boolean> {
    return this.repo.delete(id);
  }
}
