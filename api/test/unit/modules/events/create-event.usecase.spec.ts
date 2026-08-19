import { CreateEventUseCase } from "@/modules/events/application/use-cases/create-event.usecase";
import type { CreateEventDTO } from "@/modules/events/application/dto";
import { EventEntity } from "@/modules/events/domain/entities/event.entity";
import { CreateEventRepository } from "@/modules/events/domain/repositories/create-event.repository";
import { FindCityByIdUseCase } from "@/modules/cities/application/use-cases/find-city-by-id.usecase";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const dto: CreateEventDTO = {
  cityId: 1,
  citySlug: "cg",
  name: "Fest",
  description: "Descrição",
  category: "show",
  startDate: new Date("2025-06-01"),
  endDate: new Date("2025-06-02"),
  formattedDate: "Jun",
  location: "Centro",
  image: { base64: tinyPngB64, mimeType: "image/png" },
  featured: false,
  published: true,
};

describe("CreateEventUseCase", () => {
  const persisted = new EventEntity({
    id: 42,
    cityId: 1,
    citySlug: "cg",
    name: "Fest",
    description: "Descrição",
    category: "show",
    startDate: dto.startDate,
    endDate: dto.endDate,
    formattedDate: "Jun",
    location: "Centro",
    imageUrl: "https://cdn.example/e.png",
    featured: false,
    published: true,
  });

  const makeSut = () => {
    const create = jest.fn().mockResolvedValue(persisted);
    const createRepo = { create } as unknown as CreateEventRepository;
    const findCityById = {
      execute: jest.fn().mockResolvedValue({}),
    } as unknown as FindCityByIdUseCase;
    const images = {
      uploadPublicWebImage: jest.fn().mockResolvedValue({ url: "https://cdn.example/e.png" }),
    } as unknown as PublicWebImageUploader;
    const sut = new CreateEventUseCase(createRepo, findCityById, images);
    return { sut, create, findCityById, images };
  };

  it("valida cidade, faz upload, persiste e retorna entidade criada", async () => {
    const { sut, create, findCityById, images } = makeSut();

    const out = await sut.execute(dto);

    expect(findCityById.execute).toHaveBeenCalledWith(1);
    expect(images.uploadPublicWebImage).toHaveBeenCalledWith(dto.image, "events");
    expect(create).toHaveBeenCalled();
    const arg = create.mock.calls[0]![0] as EventEntity;
    expect(arg.props.imageUrl).toBe("https://cdn.example/e.png");
    expect(out.id).toBe(42);
  });
});
