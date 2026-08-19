import { CreateTouristPointUseCase } from "@/modules/tourist-points/application/use-cases/create-tourist-point.usecase";
import type { createTouristPointDTO } from "@/modules/tourist-points/application/dto";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";
import type { CreateTouristPointRepository } from "@/modules/tourist-points/domain/repositories/create-tourist-point.repository";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const dto: createTouristPointDTO = {
  cityId: 1,
  citySlug: "campo-grande",
  name: "Parque",
  description: "Descrição do parque",
  category: "parque",
  address: "Rua 1",
  openingHours: "09:00",
  image: { base64: tinyPngB64, mimeType: "image/png" },
  featured: false,
  published: true,
};

describe("CreateTouristPointUseCase", () => {
  const persisted = new TouristPointEntity({
    id: 10,
    cityId: 1,
    citySlug: "campo-grande",
    name: "Parque",
    description: "Descrição do parque",
    category: "parque",
    address: "Rua 1",
    openingHours: "09:00",
    imageUrl: "https://cdn.example/t.png",
    featured: false,
    published: true,
  });

  const makeSut = () => {
    const create = jest.fn().mockResolvedValue(persisted);
    const repo: CreateTouristPointRepository = { create };
    const images: PublicWebImageUploader = {
      uploadPublicWebImage: jest.fn().mockResolvedValue({ url: "https://cdn.example/t.png" }),
      replacePublicWebImage: jest.fn(),
    };
    const sut = new CreateTouristPointUseCase(repo, images);
    return { sut, create, images };
  };

  it("faz upload público, persiste entidade com imageUrl e retorna DTO", async () => {
    const { sut, create, images } = makeSut();

    const out = await sut.execute(dto);

    expect(images.uploadPublicWebImage).toHaveBeenCalledWith(dto.image, "tourist-points");
    expect(create).toHaveBeenCalledTimes(1);
    const arg = create.mock.calls[0]![0] as TouristPointEntity;
    expect(arg.imageUrl).toBe("https://cdn.example/t.png");
    expect(arg.name).toBe("Parque");
    expect(out).toEqual({
      id: 10,
      cityId: 1,
      citySlug: "campo-grande",
      name: "Parque",
      description: "Descrição do parque",
      category: "parque",
      address: "Rua 1",
      openingHours: "09:00",
      imageUrl: "https://cdn.example/t.png",
      featured: false,
      published: true,
    });
  });
});
