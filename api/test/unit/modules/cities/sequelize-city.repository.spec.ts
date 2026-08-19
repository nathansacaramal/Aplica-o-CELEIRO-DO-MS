import { CityModel } from "@/modules/cities/infra/models/city-model";
import { SequelizeCityRepository } from "@/modules/cities/infra/sequelize/sequelize-city.repository";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";

jest.mock("@/modules/cities/infra/models/city-model", () => ({
  CityModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn().mockResolvedValue(undefined),
  },
}));

const row = {
  id: 1,
  name: "CG",
  slug: "campo-grande",
  state: "MS",
  summary: "S",
  description: "D long enough",
  imageUrl: "https://x.com/c.jpg",
  published: true,
};

const makeEntity = () =>
  new CityEntity({
    name: "CG",
    slug: "campo-grande",
    state: "MS",
    summary: "S",
    description: "D long enough",
    imageUrl: "https://x.com/c.jpg",
    published: true,
  });

describe("SequelizeCityRepository", () => {
  const repo = new SequelizeCityRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("publicFindBySlug e findByName", async () => {
    (CityModel.findOne as jest.Mock).mockResolvedValue({ ...row });
    expect((await repo.publicFindBySlug("campo-grande"))?.id).toBe(1);
    expect(CityModel.findOne).toHaveBeenCalledWith({
      where: { slug: "campo-grande", published: true },
    });
    expect((await repo.findByName("CG"))?.slug).toBe("campo-grande");
  });

  it("publicFindBySlug null", async () => {
    (CityModel.findOne as jest.Mock).mockResolvedValue(null);
    expect(await repo.publicFindBySlug("x")).toBeNull();
  });

  it("publicList", async () => {
    (CityModel.findAll as jest.Mock).mockResolvedValue([{ ...row }]);
    const out = await repo.publicList();
    expect(out).toHaveLength(1);
    expect(CityModel.findAll).toHaveBeenCalledWith({
      where: { published: true },
      order: [["name", "ASC"]],
    });
  });

  it("create", async () => {
    (CityModel.create as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.create(makeEntity());
    expect(out.id).toBe(1);
    expect(CityModel.sync).toHaveBeenCalled();
  });

  it("list", async () => {
    (CityModel.findAll as jest.Mock).mockResolvedValue([{ ...row }]);
    expect((await repo.list()).length).toBe(1);
  });

  it("findById", async () => {
    (CityModel.findByPk as jest.Mock).mockResolvedValue({ ...row });
    expect((await repo.findById(1))?.id).toBe(1);
  });

  it("edit null quando zero afetados", async () => {
    (CityModel.update as jest.Mock).mockResolvedValue([0]);
    expect(await repo.edit(1, { name: "X" })).toBeNull();
  });

  it("edit sucesso", async () => {
    (CityModel.update as jest.Mock).mockResolvedValue([1]);
    (CityModel.findByPk as jest.Mock).mockResolvedValue({ ...row, name: "X" });
    const out = await repo.edit(1, { name: "X" });
    expect(out?.name).toBe("X");
  });

  it("delete", async () => {
    (CityModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(1)).toBe(true);
  });
});
