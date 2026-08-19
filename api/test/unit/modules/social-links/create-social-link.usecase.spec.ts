import { CreateSocialLinkUseCase } from "@/modules/social-links/application/use-cases/create-social-link.usecase";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";
import { CreateSocialLinkRepository } from "@/modules/social-links/domain/repositories/create-social-link.repository";

describe("CreateSocialLinkUseCase", () => {
  const entity = new SocialLinkEntity({
    id: 0,
    platform: "instagram",
    label: "IG",
    url: "https://instagram.com/x",
    active: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("retorna entidade criada quando o repositório persiste", async () => {
    const saved = new SocialLinkEntity({
      id: 5,
      platform: entity.platform,
      label: entity.label,
      url: entity.url,
      active: entity.active,
      order: entity.order,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
    const repo: CreateSocialLinkRepository = {
      create: jest.fn(async () => saved),
    };
    const sut = new CreateSocialLinkUseCase(repo);
    const result = await sut.execute(entity);
    expect(repo.create).toHaveBeenCalledWith(entity);
    expect(result).toBe(saved);
  });

  it("retorna null quando o repositório falha", async () => {
    const repo: CreateSocialLinkRepository = {
      create: jest.fn(async () => null),
    };
    const sut = new CreateSocialLinkUseCase(repo);
    expect(await sut.execute(entity)).toBeNull();
  });
});
