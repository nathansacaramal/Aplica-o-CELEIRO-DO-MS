import TouristPointModel from "@/modules/tourist-points/infra/model/tourist-point-model";
import { SequelizeTouristPointRepository } from "@/modules/tourist-points/infra/sequelize/sequelize-tourist-point.repository";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";

jest.mock("@/modules/tourist-points/infra/model/tourist-point-model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

const modelRow = {
  id: 10,
  cityId: 2,
  citySlug: "campo-grande",
  name: "Parque",
  description: "D",
  category: "parque",
  address: "Rua A",
  openingHours: "8-18",
  imageUrl: "https://x.com/i.jpg",
  featured: true,
  published: true,
};

const makeEntity = () =>
  new TouristPointEntity({
    cityId: 2,
    citySlug: "campo-grande",
    name: "Parque",
    description: "D",
    category: "parque",
    address: "Rua A",
    openingHours: "8-18",
    imageUrl: "https://x.com/i.jpg",
    featured: true,
    published: true,
  });

describe("SequelizeTouristPointRepository", () => {
  const repo = new SequelizeTouristPointRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create persiste e mapeia entidade", async () => {
    (TouristPointModel.create as jest.Mock).mockResolvedValue({
      ...modelRow,
    });

    const out = await repo.create(makeEntity());

    expect(TouristPointModel.create).toHaveBeenCalled();
    expect(out.id).toBe(10);
    expect(out.name).toBe("Parque");
  });

  it("findById retorna null quando não existe", async () => {
    (TouristPointModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.findById(99)).toBeNull();
  });

  it("findById retorna entidade quando existe", async () => {
    (TouristPointModel.findByPk as jest.Mock).mockResolvedValue({ ...modelRow });
    const out = await repo.findById(10);
    expect(out?.id).toBe(10);
    expect(out?.citySlug).toBe("campo-grande");
  });

  it("findByCityId mapeia lista", async () => {
    (TouristPointModel.findAll as jest.Mock).mockResolvedValue([{ ...modelRow }]);
    const out = await repo.findByCityId(2);
    expect(out).toHaveLength(1);
    expect(out?.[0]?.id).toBe(10);
  });

  it("update retorna null quando nenhuma linha afetada", async () => {
    (TouristPointModel.update as jest.Mock).mockResolvedValue([0]);
    expect(await repo.update(10, { name: "X" })).toBeNull();
  });

  it("update retorna entidade após sucesso", async () => {
    (TouristPointModel.update as jest.Mock).mockResolvedValue([1]);
    (TouristPointModel.findByPk as jest.Mock).mockResolvedValue({
      ...modelRow,
      name: "Atualizado",
    });
    const out = await repo.update(10, { name: "Atualizado" });
    expect(out?.name).toBe("Atualizado");
  });

  it("delete retorna true quando removeu", async () => {
    (TouristPointModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(10)).toBe(true);
  });

  it("delete retorna false quando não removeu", async () => {
    (TouristPointModel.destroy as jest.Mock).mockResolvedValue(0);
    expect(await repo.delete(10)).toBe(false);
  });

  it("listSpec delega findAndCountAll", async () => {
    (TouristPointModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [{ ...modelRow }],
      count: 1,
    });
    const out = await repo.listSpec({
      spec: null,
      limit: 10,
      offset: 0,
      order: [["id", "DESC"]],
    });
    expect(out.count).toBe(1);
    expect(out.rows).toHaveLength(1);
  });
});
