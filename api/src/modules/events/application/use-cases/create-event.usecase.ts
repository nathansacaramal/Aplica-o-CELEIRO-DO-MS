import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { EventEntity } from "../../domain/entities/event.entity";
import { CreateEventDTO } from "../dto";

import { FindCityByIdUseCase } from "@/modules/cities/application/use-cases/find-city-by-id.usecase";
import { CreateEventRepository } from "../../domain/repositories/create-event.repository";

export class CreateEventUseCase {
  constructor(
    private readonly createRepo: CreateEventRepository,
    private readonly findCityById: FindCityByIdUseCase,
    private readonly images: PublicWebImageUploader,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(dto: CreateEventDTO): Promise<EventEntity> {
    this.logger.info("CreateEventUseCase:start", {
      cityId: dto.cityId,
      cat: dto.category,
    });

    await this.findCityById.execute(dto.cityId);

    const { image, ...fields } = dto;
    const { url: imageUrl } = await this.images.uploadPublicWebImage(image, "events");

    const entity = new EventEntity({
      id: 0,
      ...fields,
      imageUrl,
    });

    const created = await this.createRepo.create(entity);

    this.logger.info("CreateEventUseCase:success", {
      id: created.id,
      cityId: created.cityId,
    });
    return created;
  }
}
