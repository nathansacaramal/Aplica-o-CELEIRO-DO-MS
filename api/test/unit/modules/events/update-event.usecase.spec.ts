import { AppError } from "@/core/errors-app-error";
import { FindCityByIdUseCase } from "@/modules/cities/application/use-cases/find-city-by-id.usecase";
import { UpdateEventUseCase } from "@/modules/events/application/use-cases/update-event.usecase";
import type { UpdateEventDTO } from "@/modules/events/application/dto";
import { EventEntity } from "@/modules/events/domain/entities/event.entity";
import type { FindEventByIdRepository } from "@/modules/events/domain/repositories/find-event-by-id.repository";
import type { UpdateEventRepository } from "@/modules/events/domain/repositories/update-event.repository";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import type { DomainLogger } from "@/core/logger/domain-logger";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const existing = new EventEntity({
  id: 3,
  cityId: 1,
  citySlug: "cg",
  name: "Fest",
  description: "D",
  category: "show",
  startDate: new Date(),
  endDate: new Date(),
  formattedDate: "—",
  location: "L",
  imageUrl: "https://cdn/old.jpg",
  featured: false,
  published: true,
});

const updated = new EventEntity({
  ...existing.props,
  name: "Fest 2",
  imageUrl: "https://cdn/new.jpg",
});

describe("UpdateEventUseCase", () => {
  const makeSut = () => {
    const findByIdRepo: FindEventByIdRepository = {
      findById: jest.fn(async (id: number) => (id === 3 ? existing : null)),
    };
    const updateRepo: UpdateEventRepository = {
      update: jest.fn(async () => updated),
    };
    const findCityById = {
      execute: jest.fn().mockResolvedValue({}),
    } as unknown as FindCityByIdUseCase;
    const images: PublicWebImageUploader = {
      uploadPublicWebImage: jest.fn(),
      replacePublicWebImage: jest.fn().mockResolvedValue({ url: "https://cdn/new.jpg" }),
    };
    const logger: DomainLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    const sut = new UpdateEventUseCase(findByIdRepo, updateRepo, findCityById, images, logger);
    return {
      sut,
      findByIdRepo,
      updateRepo,
      findCityById,
      images,
      logger,
    };
  };

  it("lança EVENT_NOT_FOUND quando evento não existe", async () => {
    const { sut } = makeSut();
    await expect(sut.execute(99, { name: "X" })).rejects.toMatchObject({
      code: "EVENT_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("valida cidade quando cityId vem no DTO", async () => {
    const { sut, findCityById } = makeSut();
    const dto: UpdateEventDTO = { cityId: 2, name: "A" };

    await sut.execute(3, dto);

    expect(findCityById.execute).toHaveBeenCalledWith(2);
  });

  it("não chama FindCityById quando cityId omitido", async () => {
    const { sut, findCityById } = makeSut();
    await sut.execute(3, { name: "Só nome" });
    expect(findCityById.execute).not.toHaveBeenCalled();
  });

  it("replacePublicWebImage quando há imagem no DTO", async () => {
    const { sut, images, updateRepo } = makeSut();
    const image = { base64: tinyPngB64, mimeType: "image/png" as const };

    await sut.execute(3, { image });

    expect(images.replacePublicWebImage).toHaveBeenCalledWith(existing.imageUrl, image, "events");
    expect(updateRepo.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ imageUrl: "https://cdn/new.jpg" }),
    );
  });

  it("lança EVENT_UPDATE_FAILED quando update retorna null", async () => {
    const findByIdRepo: FindEventByIdRepository = {
      findById: jest.fn(async () => existing),
    };
    const updateRepo: UpdateEventRepository = {
      update: jest.fn(async () => null),
    };
    const findCityById = {
      execute: jest.fn(),
    } as unknown as FindCityByIdUseCase;
    const images: PublicWebImageUploader = {
      uploadPublicWebImage: jest.fn(),
      replacePublicWebImage: jest.fn(),
    };
    const sut = new UpdateEventUseCase(findByIdRepo, updateRepo, findCityById, images);

    await expect(sut.execute(3, { name: "X" })).rejects.toMatchObject({
      code: "EVENT_UPDATE_FAILED",
      statusCode: 500,
    });
  });

  it("sucesso retorna entidade e loga", async () => {
    const { sut, logger } = makeSut();
    const out = await sut.execute(3, { name: "Fest 2" });
    expect(out.name).toBe("Fest 2");
    expect(logger.info).toHaveBeenCalledWith("UpdateEventUseCase:success", {
      id: 3,
    });
  });

  it("propaga AppError do FindCityById", async () => {
    const { sut, findCityById, updateRepo } = makeSut();
    (findCityById.execute as jest.Mock).mockRejectedValue(
      new AppError({
        code: "CIDADE_NOT_FOUND",
        message: "Cidade 9 não encontrada",
        statusCode: 404,
      }),
    );

    await expect(sut.execute(3, { cityId: 9 })).rejects.toMatchObject({
      code: "CIDADE_NOT_FOUND",
    });
    expect(updateRepo.update).not.toHaveBeenCalled();
  });
});
