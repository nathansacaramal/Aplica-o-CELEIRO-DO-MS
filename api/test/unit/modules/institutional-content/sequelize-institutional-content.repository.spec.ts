import InstitutionalContentModel from "@/modules/institutional-content/infra/model/institutional-content-model";
import { SequelizeInstitutionalContentRepository } from "@/modules/institutional-content/infra/sequelize/sequelize-institutional-content.repository";
import { InstitutionalContentEntity } from "@/modules/institutional-content/domain/entities/institutional-content.entity";

jest.mock("@/modules/institutional-content/infra/model/institutional-content-model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const now = new Date();
const row = {
  id: 1,
  aboutTitle: "A",
  aboutText: "AT",
  whoWeAreTitle: "W",
  WhoWeAreText: "WT",
  purposeTitle: "P",
  purposeText: "PT",
  mission: "M",
  vision: "V",
  valuesJson: "[]",
  createdAt: now,
  updatedAt: now,
};

const entity = new InstitutionalContentEntity({
  id: 1,
  aboutTitle: "A",
  aboutText: "AT",
  whoWeAreTitle: "W",
  whoWeAreText: "WT",
  purposeTitle: "P",
  purposeText: "PT",
  mission: "M",
  vision: "V",
  valuesJson: "[]",
  createdAt: now,
  updatedAt: now,
});

describe("SequelizeInstitutionalContentRepository", () => {
  const repo = new SequelizeInstitutionalContentRepository();

  beforeEach(() => jest.clearAllMocks());

  it("create", async () => {
    (InstitutionalContentModel.create as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.create(entity);
    expect(out?.id).toBe(1);
  });

  it("findById e getAll", async () => {
    (InstitutionalContentModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.findById(9)).toBeNull();
    (InstitutionalContentModel.findByPk as jest.Mock).mockResolvedValue({ ...row });
    expect((await repo.findById(1))?.mission).toBe("M");
    (InstitutionalContentModel.findAll as jest.Mock).mockResolvedValue([{ ...row }]);
    expect((await repo.getAll())?.length).toBe(1);
  });

  it("delete", async () => {
    (InstitutionalContentModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(1)).toBe(true);
  });

  it("update null e sucesso", async () => {
    (InstitutionalContentModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.update(1, { mission: "X" })).toBeNull();

    const inst = {
      ...row,
      update: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
        Object.assign(inst, data);
        return inst;
      }),
    };
    (InstitutionalContentModel.findByPk as jest.Mock).mockResolvedValue(inst);
    const out = await repo.update(1, { mission: "Nova" });
    expect(out?.mission).toBe("Nova");
  });
});
