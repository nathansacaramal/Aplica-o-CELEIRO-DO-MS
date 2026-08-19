import sequelize from "@/core/database";
import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import { CityEntity } from "../../domain/entities/city.entity";
import { FindCityByNameRepository } from "../../domain/repositories";
import { CreateCityRepository } from "../../domain/repositories/create-city.repository";
import { CreateCityDTO } from "../dto";

export class CreateCityUseCase {
  constructor(
    private createCityRepository: CreateCityRepository,
    private readonly findCityByNameRepository: FindCityByNameRepository,
    private readonly images: PublicWebImageUploader,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(dto: CreateCityDTO): Promise<CityEntity> {
    this.logger.info("Iniciando CreateCidadeUseCase", {
      nome: dto.name,
      uf: dto.state,
    });

    const existing = await this.findCityByNameRepository.findByName(dto.name);

    if (existing) {
      throw new AppError({
        code: "CITY_ALREADY_EXISTS",
        message: `A cidade ${dto.name} já está cadastrada`,
        statusCode: 409,
        details: { name: dto.name },
      });
    }
    const transaction = await sequelize.transaction();

    try {
      const { image, ...fields } = dto;
      const { url: imageUrl } = await this.images.uploadPublicWebImage(image, "cities");

      const city = new CityEntity({
        id: 0,
        ...fields,
        imageUrl,
        published: dto.published,
      });

      const created = await this.createCityRepository.create(city, transaction);

      await transaction.commit();

      this.logger.info("Cidade criada com sucesso", {
        cityId: created.id,
        nome: created.name,
        uf: created.state,
      });
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
