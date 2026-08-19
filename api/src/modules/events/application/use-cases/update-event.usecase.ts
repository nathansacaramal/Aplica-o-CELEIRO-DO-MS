import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { FindCityByIdUseCase } from "@/modules/cities/application/use-cases/find-city-by-id.usecase";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { EventEntity, EventProps } from "../../domain/entities/event.entity";
import { FindEventByIdRepository } from "../../domain/repositories/find-event-by-id.repository";
import { UpdateEventRepository } from "../../domain/repositories/update-event.repository";
import { UpdateEventDTO } from "../dto";

export class UpdateEventUseCase {
  constructor(
    private readonly findByIdRepo: FindEventByIdRepository,
    private readonly updateRepo: UpdateEventRepository,
    private readonly findCityById: FindCityByIdUseCase,
    private readonly images: PublicWebImageUploader,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(id: number, dto: UpdateEventDTO): Promise<EventEntity> {
    const existing = await this.findByIdRepo.findById(id);
    if (!existing) {
      throw new AppError({
        code: "EVENT_NOT_FOUND",
        message: `Evento ${id} não encontrado`,
        statusCode: 404,
        details: { id },
      });
    }

    if (dto.cityId !== undefined) {
      await this.findCityById.execute(Number(dto.cityId));
    }

    const { image, ...rest } = dto;
    const payload: Partial<EventProps> = { ...rest };

    if (image) {
      const { url } = await this.images.replacePublicWebImage(existing.imageUrl, image, "events");
      payload.imageUrl = url;
    }

    const updated = await this.updateRepo.update(id, payload);
    if (!updated) {
      throw new AppError({
        code: "EVENT_UPDATE_FAILED",
        message: `Falha ao atualizar evento ${id}`,
        statusCode: 500,
        details: { id },
      });
    }

    this.logger.info("UpdateEventUseCase:success", { id });
    return updated;
  }
}
