import HomeHighLightsModel from "@/modules/home-highlights/infra/model/home-highlights-model";
import { SequelizeHomeHighlightRepository } from "@/modules/home-highlights/infra/sequelize/sequelize-home-highlight.repository";

jest.mock("@/modules/home-highlights/infra/model/home-highlights-model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const row = {
  id: 2,
  type: "event" as const,
  referenceId: 10,
  title: "H",
  description: "D",
  cityName: "CG",
  imageUrl: "https://x.com/h.jpg",
  ctaUrl: "https://x.com",
  active: true,
  order: 1,
};

describe("SequelizeHomeHighlightRepository", () => {
  const repo = new SequelizeHomeHighlightRepository();

  beforeEach(() => jest.clearAllMocks());

  it("create", async () => {
    (HomeHighLightsModel.create as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.create({
      type: "event",
      referenceId: 10,
      title: "H",
      description: "D",
      cityName: "CG",
      imageUrl: "https://x.com/h.jpg",
      ctaUrl: "https://x.com",
      active: true,
      order: 1,
    });
    expect(out?.id).toBe(2);
    expect(out?.type).toBe("event");
  });

  it("create retorna null se model não retornar", async () => {
    (HomeHighLightsModel.create as jest.Mock).mockResolvedValue(null);
    expect(
      await repo.create({
        type: "custom",
        referenceId: 0,
        title: "H",
        description: "D",
        cityName: "CG",
        imageUrl: "https://x.com/h.jpg",
        ctaUrl: "https://x.com",
        active: true,
        order: 1,
      }),
    ).toBeNull();
  });

  it("findById", async () => {
    (HomeHighLightsModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.findById(1)).toBeNull();
    (HomeHighLightsModel.findByPk as jest.Mock).mockResolvedValue({ ...row });
    expect((await repo.findById(2))?.title).toBe("H");
  });

  it("getAll", async () => {
    (HomeHighLightsModel.findAll as jest.Mock).mockResolvedValue([{ ...row }]);
    const all = await repo.getAll();
    expect(all?.length).toBe(1);
  });

  it("delete", async () => {
    (HomeHighLightsModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(2)).toBe(true);
  });

  it("update null e sucesso", async () => {
    (HomeHighLightsModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.update(1, { title: "X" })).toBeNull();

    const inst = {
      ...row,
      update: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
        Object.assign(inst, data);
        return inst;
      }),
    };
    (HomeHighLightsModel.findByPk as jest.Mock).mockResolvedValue(inst);
    const out = await repo.update(2, { title: "Novo" });
    expect(out?.title).toBe("Novo");
  });
});
