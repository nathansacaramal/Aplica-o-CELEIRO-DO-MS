import { UpdateHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/update-home-highlight.usecase";
import { HomeHighlightEntity } from "@/modules/home-highlights/domain/entities/home-highlight.entity";
import { FindHomeHighlightByIdRepository } from "@/modules/home-highlights/domain/repositories/find-home-highlight-by-id.repository";
import { UpdateHomeHighlightRepository } from "@/modules/home-highlights/domain/repositories/update-home-highlight.repository";

describe("UpdateHomeHighlightUseCase", () => {
  const existing = new HomeHighlightEntity({
    id: 1,
    type: "event",
    referenceId: 10,
    title: "Old",
    description: "Desc",
    cityName: "Campo Grande",
    imageUrl: "https://x.com/i.jpg",
    ctaUrl: "https://x.com",
    active: true,
    order: 1,
  });

  const makeSut = () => {
    const findById: FindHomeHighlightByIdRepository = {
      findById: jest.fn(async (id) => (id === 1 ? existing : null)),
    };
    const update = {
      update: jest.fn(async (id: number, entity: HomeHighlightEntity) =>
        id === 1 ? entity : null,
      ),
    } as UpdateHomeHighlightRepository;
    const images = {
      replacePublicWebImage: jest.fn(),
    };
    return {
      sut: new UpdateHomeHighlightUseCase(findById, update, images as never),
      findById,
      update,
      images,
    };
  };

  it("atualiza quando existe", async () => {
    const { sut, update } = makeSut();
    const result = await sut.execute(1, { title: "New" });
    expect(result?.title).toBe("New");
    expect(update.update).toHaveBeenCalled();
  });

  it("retorna null quando não existe", async () => {
    const { sut } = makeSut();
    expect(await sut.execute(99, { title: "X" })).toBeNull();
  });
});
