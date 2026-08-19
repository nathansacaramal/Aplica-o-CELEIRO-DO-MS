import SocialMediaLinksModel from "@/modules/social-links/infra/model/social-links-model";
import { SequelizeSocialLinkRepository } from "@/modules/social-links/infra/sequelize/sequelize-social-link.repository";
import { SocialLinkEntity } from "@/modules/social-links/domain/entities/social-link.entity";

jest.mock("@/modules/social-links/infra/model/social-links-model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

const row = {
  id: 3,
  platform: "instagram",
  label: "IG",
  url: "https://instagram.com/x",
  active: true,
  order: 2,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
};

const makeEntity = () =>
  new SocialLinkEntity({
    id: 0,
    platform: "instagram",
    label: "IG",
    url: "https://instagram.com/x",
    active: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("SequelizeSocialLinkRepository", () => {
  const repo = new SequelizeSocialLinkRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create mapeia modelo para entidade", async () => {
    (SocialMediaLinksModel.create as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.create(makeEntity());
    expect(SocialMediaLinksModel.create).toHaveBeenCalled();
    expect(out?.id).toBe(3);
    expect(out?.label).toBe("IG");
  });

  it("getAll retorna lista mapeada", async () => {
    (SocialMediaLinksModel.findAll as jest.Mock).mockResolvedValue([{ ...row }]);
    const out = await repo.getAll();
    expect(out).toHaveLength(1);
    expect(out?.[0]?.id).toBe(3);
  });

  it("findById retorna null quando ausente", async () => {
    (SocialMediaLinksModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.findById(9)).toBeNull();
  });

  it("findById retorna entidade", async () => {
    (SocialMediaLinksModel.findByPk as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.findById(3);
    expect(out?.url).toBe("https://instagram.com/x");
  });

  it("update retorna entidade após save", async () => {
    const instance = {
      id: row.id,
      platform: row.platform,
      label: row.label,
      url: row.url,
      active: row.active,
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      update: jest.fn().mockResolvedValue(undefined),
    };
    (SocialMediaLinksModel.findByPk as jest.Mock).mockResolvedValue(instance);
    const entity = new SocialLinkEntity({ ...row });
    const out = await repo.update(3, entity);
    expect(instance.update).toHaveBeenCalled();
    expect(out?.id).toBe(3);
  });

  it("update retorna null quando link não existe", async () => {
    (SocialMediaLinksModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.update(9, new SocialLinkEntity({ ...row, id: 9 }))).toBeNull();
  });

  it("delete retorna resultado do destroy", async () => {
    (SocialMediaLinksModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(3)).toBe(true);
  });
});
