import { CreateHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/create-home-highlight.usecase";
import type { CreateHomeHighlightDTO } from "@/modules/home-highlights/application/dto";
import { HomeHighlightEntity } from "@/modules/home-highlights/domain/entities/home-highlight.entity";
import { CreateHomeHighlightRepository } from "@/modules/home-highlights/domain/repositories/create-home-highlight.repository";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("CreateHomeHighlightUseCase", () => {
  const dto = {
    type: "custom" as const,
    referenceId: 1,
    title: "Título",
    description: "Descrição longa o suficiente",
    cityName: "Campo Grande",
    image: { base64: tinyPngB64, mimeType: "image/png" as const },
    ctaUrl: "https://example.com",
    active: true,
    order: 1,
  } satisfies CreateHomeHighlightDTO;

  const uploadedUrl = "https://cdn.example/public/home-highlights/x.png";

  it("faz upload e delega create ao repositório", async () => {
    const created = new HomeHighlightEntity({
      id: 1,
      type: dto.type,
      referenceId: dto.referenceId,
      title: dto.title,
      description: dto.description,
      cityName: dto.cityName,
      imageUrl: uploadedUrl,
      ctaUrl: dto.ctaUrl,
      active: dto.active,
      order: dto.order,
    });
    const repo: CreateHomeHighlightRepository = {
      create: jest.fn(async () => created),
    };
    const images = {
      uploadPublicWebImage: jest.fn().mockResolvedValue({ url: uploadedUrl }),
    };
    const sut = new CreateHomeHighlightUseCase(repo, images as never);
    const result = await sut.execute(dto);
    expect(images.uploadPublicWebImage).toHaveBeenCalledWith(dto.image, "home-highlights");
    expect(repo.create).toHaveBeenCalledWith({
      type: dto.type,
      referenceId: dto.referenceId,
      title: dto.title,
      description: dto.description,
      cityName: dto.cityName,
      ctaUrl: dto.ctaUrl,
      active: dto.active,
      order: dto.order,
      imageUrl: uploadedUrl,
    });
    expect(result).toBe(created);
  });
});
