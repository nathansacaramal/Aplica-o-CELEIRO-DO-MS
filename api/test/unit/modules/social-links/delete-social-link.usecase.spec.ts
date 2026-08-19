import { DeleteSocialLinkUseCase } from "@/modules/social-links/application/use-cases/delete-social-link.usecase";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";
import { DeleteSocialLinkRepository } from "@/modules/social-links/domain/repositories/delete-social-link.repository";
import { FindSocialLinkByIdRepository } from "@/modules/social-links/domain/repositories/find-social-link-by-id.repository";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

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

describe("DeleteSocialLinkUseCase", () => {
  it("retorna false e não chama delete quando não existe", async () => {
    const findById: FindSocialLinkByIdRepository = {
      findById: jest.fn(async () => null),
    };
    const del: DeleteSocialLinkRepository = {
      delete: jest.fn(async () => true),
    };
    const sut = new DeleteSocialLinkUseCase(findById, del);
    expect(await sut.execute(99)).toBe(false);
    expect(del.delete).not.toHaveBeenCalled();
  });

  it("retorna true quando encontra e o repositório remove", async () => {
    const findById: FindSocialLinkByIdRepository = {
      findById: jest.fn(async (id) => (id === 1 ? existing : null)),
    };
    const del: DeleteSocialLinkRepository = {
      delete: jest.fn(async () => true),
    };
    const sut = new DeleteSocialLinkUseCase(findById, del);
    expect(await sut.execute(1)).toBe(true);
    expect(del.delete).toHaveBeenCalledWith(1);
  });

  it("retorna false quando delete no repositório falha", async () => {
    const findById: FindSocialLinkByIdRepository = {
      findById: jest.fn(async () => existing),
    };
    const del: DeleteSocialLinkRepository = {
      delete: jest.fn(async () => false),
    };
    const sut = new DeleteSocialLinkUseCase(findById, del);
    expect(await sut.execute(1)).toBe(false);
  });
});
