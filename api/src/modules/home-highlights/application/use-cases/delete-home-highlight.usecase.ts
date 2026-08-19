import { DeleteHomeHighlightRepository } from "../../domain/repositories/delete-home-highlight.repository";

export class DeleteHomeHighlightUseCase {
  constructor(private readonly repo: DeleteHomeHighlightRepository) {}

  async execute(id: number): Promise<boolean> {
    return await this.repo.delete(id);
  }
}
