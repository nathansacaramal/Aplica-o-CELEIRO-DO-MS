import { UpdateSocialLinkUseCase } from "@/modules/social-links/application/use-cases/update-social-link.usecase";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";
import { FindSocialLinkByIdRepository } from "@/modules/social-links/domain/repositories/find-social-link-by-id.repository";
import { UpdateSocialLinkRepository } from "@/modules/social-links/domain/repositories/update-social-link.repository";

describe("UpdateSocialLinkUseCase", () => {
  const existing = new SocialLinkEntity({
    id: 1,
    platform: "instagram",
    label: "IG",
    url: "https://instagram.com/x",
    active: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const makeSut = () => {
    const findById: FindSocialLinkByIdRepository = {
      findById: jest.fn(async (id: number) => (id === 1 ? existing : null)),
    };
    const update: UpdateSocialLinkRepository = {
      update: jest.fn(async (id, entity) => (id === 1 ? entity : null)),
    };
    const sut = new UpdateSocialLinkUseCase(findById, update);
    return { sut, findById, update };
  };

  it("atualiza quando existe", async () => {
    const { sut, update } = makeSut();
    const result = await sut.execute(1, { label: "Novo" });
    expect(result).not.toBeNull();
    expect(result?.label).toBe("Novo");
    expect(update.update).toHaveBeenCalled();
  });

  it("retorna null quando não existe", async () => {
    const { sut } = makeSut();
    const result = await sut.execute(99, { label: "X" });
    expect(result).toBeNull();
  });

  it("retorna null quando o repositório update falha após encontrar", async () => {
    const findById: FindSocialLinkByIdRepository = {
      findById: jest.fn(async () => existing),
    };
    const update: UpdateSocialLinkRepository = {
      update: jest.fn(async () => null),
    };
    const sut = new UpdateSocialLinkUseCase(findById, update);
    expect(await sut.execute(1, { label: "X" })).toBeNull();
  });
});
