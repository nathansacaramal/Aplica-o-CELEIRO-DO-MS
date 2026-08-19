import { GetSocialLinkUseCase } from "@/modules/social-links/application/use-cases/get-social-link.usecase";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";
import { GetSocialLinkRepository } from "@/modules/social-links/domain/repositories/get-social-link.repository";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const makeEntity = (id: number) =>
  new SocialLinkEntity({
    id,
    platform: "instagram",
    label: "IG",
    url: "https://instagram.com/x",
    active: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("GetSocialLinkUseCase", () => {
  it("retorna a lista quando o repositório tem itens", async () => {
    const list = [makeEntity(1)];
    const repo: GetSocialLinkRepository = {
      getAll: jest.fn(async () => list),
    };
    const sut = new GetSocialLinkUseCase(repo);
    const result = await sut.execute();
    expect(repo.getAll).toHaveBeenCalled();
    expect(result).toBe(list);
  });

  it("retorna array vazio quando não há registros", async () => {
    const repo: GetSocialLinkRepository = {
      getAll: jest.fn(async () => []),
    };
    const sut = new GetSocialLinkUseCase(repo);
    expect(await sut.execute()).toEqual([]);
  });

  it("repassa null quando o repositório retorna null", async () => {
    const repo: GetSocialLinkRepository = {
      getAll: jest.fn(async () => null),
    };
    const sut = new GetSocialLinkUseCase(repo);
    expect(await sut.execute()).toBeNull();
  });
});
