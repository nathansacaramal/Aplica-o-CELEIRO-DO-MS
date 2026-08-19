import { UpdateTouristPointUseCase } from "@/modules/tourist-points/application/use-cases/update-tourist-point.usecase";
import type { updateTouristPointDTO } from "@/modules/tourist-points/application/dto";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";
import type { FindTouristPointByIdRepository } from "@/modules/tourist-points/domain/repositories";
import type { UpdateTouristPointRepository } from "@/modules/tourist-points/domain/repositories/update-tourist-point.repository";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const existing = new TouristPointEntity({
  id: 5,
  cityId: 1,
  citySlug: "cg",
  name: "Museu",
  description: "D",
  category: "museu",
  address: "Rua B",
  openingHours: "10:00",
  imageUrl: "https://cdn.example/old.png",
  featured: true,
  published: true,
});

describe("UpdateTouristPointUseCase", () => {
  const updatedEntity = new TouristPointEntity({
    id: 5,
    cityId: 1,
    citySlug: "cg",
    name: "Museu Novo",
    description: "D",
    category: "museu",
    address: "Rua B",
    openingHours: "10:00",
    imageUrl: "https://cdn.example/new.png",
    featured: true,
    published: false,
  });

  const makeSut = () => {
    const findById: FindTouristPointByIdRepository = {
      findById: jest.fn(async (id: number) => (id === 5 ? existing : null)),
    };
    const update = jest.fn().mockResolvedValue(updatedEntity);
    const repository: UpdateTouristPointRepository = { update };
    const images: PublicWebImageUploader = {
      uploadPublicWebImage: jest.fn(),
      replacePublicWebImage: jest.fn().mockResolvedValue({ url: "https://cdn.example/new.png" }),
    };
    const sut = new UpdateTouristPointUseCase(findById, repository, images);
    return { sut, findById, update, images };
  };

  it("lança 404 quando ponto não existe", async () => {
    const { sut } = makeSut();
    await expect(sut.execute(99, { name: "X" })).rejects.toMatchObject({
      code: "PONTO_TURISTICO_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("atualiza sem imagem: não chama replacePublicWebImage", async () => {
    const { sut, images, update } = makeSut();
    const patch: updateTouristPointDTO = { name: "Museu Novo", published: false };

    const out = await sut.execute(5, patch);

    expect(images.replacePublicWebImage).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(5, patch);
    expect(out.name).toBe("Museu Novo");
  });

  it("com imagem: replacePublicWebImage e merge de imageUrl", async () => {
    const { sut, images, update } = makeSut();
    const image = { base64: tinyPngB64, mimeType: "image/png" as const };

    await sut.execute(5, { image });

    expect(images.replacePublicWebImage).toHaveBeenCalledWith(
      existing.imageUrl,
      image,
      "tourist-points",
    );
    expect(update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ imageUrl: "https://cdn.example/new.png" }),
    );
  });

  it("lança 404 quando repositório update retorna null", async () => {
    const findById: FindTouristPointByIdRepository = {
      findById: jest.fn(async () => existing),
    };
    const repository: UpdateTouristPointRepository = {
      update: jest.fn(async () => null),
    };
    const images: PublicWebImageUploader = {
      uploadPublicWebImage: jest.fn(),
      replacePublicWebImage: jest.fn(),
    };
    const sut = new UpdateTouristPointUseCase(findById, repository, images);

    await expect(sut.execute(5, { name: "X" })).rejects.toMatchObject({
      code: "PONTO_TURISTICO_NOT_FOUND",
      statusCode: 404,
    });
  });
});
