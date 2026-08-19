import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { EventEntity } from "../../domain/entities/event.entity";
import { FindEventByIdRepository } from "../../domain/repositories/find-event-by-id.repository";

export class GetEventByIdUseCase {
  constructor(
    private readonly findByIdRepo: FindEventByIdRepository,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(id: number): Promise<EventEntity> {
    const found = await this.findByIdRepo.findById(id);
    if (!found) {
      throw new AppError({
        code: "EVENT_NOT_FOUND",
        message: `Evento ${id} não encontrado`,
        statusCode: 404,
        details: { id },
      });
    }
    return found;
  }
}
