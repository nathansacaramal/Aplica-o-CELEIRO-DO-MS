import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { FindEventByIdRepository } from "../../domain/repositories/find-event-by-id.repository";
import { DeleteEventRepository } from "../../domain/repositories/delete-event.repository";

export class DeleteEventUseCase {
  constructor(
    private readonly findByIdRepo: FindEventByIdRepository,
    private readonly deleteRepo: DeleteEventRepository,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute({ id }: { id: number }): Promise<boolean> {
    const existing = await this.findByIdRepo.findById(id);
    if (!existing) return false;

    const deleted = await this.deleteRepo.delete(id);

    this.logger.info("DeleteEventUseCase:done", { id, deleted });
    return deleted;
  }
}
