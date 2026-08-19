import { FindSocialLinkByIdUseCase } from "@/modules/social-links/application/use-cases/find-social-link-by-id.usecase";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";
import { FindSocialLinkByIdRepository } from "@/modules/social-links/domain/repositories/find-social-link-by-id.repository";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const entity = new SocialLinkEntity({
  id: 2,
  platform: "facebook",
  label: "FB",
  url: "https://facebook.com/x",
  active: true,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("FindSocialLinkByIdUseCase", () => {
  it("retorna a entidade quando existe", async () => {
    const repo: FindSocialLinkByIdRepository = {
      findById: jest.fn(async (id) => (id === 2 ? entity : null)),
    };
    const sut = new FindSocialLinkByIdUseCase(repo);
    const result = await sut.execute(2);
    expect(repo.findById).toHaveBeenCalledWith(2);
    expect(result).toBe(entity);
  });

  it("retorna null quando não existe", async () => {
    const repo: FindSocialLinkByIdRepository = {
      findById: jest.fn(async () => null),
    };
    const sut = new FindSocialLinkByIdUseCase(repo);
    expect(await sut.execute(404)).toBeNull();
  });
});
