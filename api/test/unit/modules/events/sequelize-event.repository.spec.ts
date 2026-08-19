import EventModel from "@/modules/events/infra/model/event-model";
import { SequelizeEventRepository } from "@/modules/events/infra/repositories/sequelize-event.repository";
import { EventEntity } from "@/modules/events/domain/entities/event.entity";

jest.mock("@/modules/events/infra/model/event-model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

const row = {
  id: 7,
  cityId: 1,
  citySlug: "cg",
  name: "Fest",
  description: "D",
  category: "show",
  startDate: new Date(),
  endDate: new Date(),
  formattedDate: "2025-01-01",
  location: "L",
  imageUrl: "https://x.com/e.jpg",
  featured: true,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeEntity = () =>
  new EventEntity({
    id: 0,
    cityId: 1,
    citySlug: "cg",
    name: "Fest",
    description: "D",
    category: "show",
    startDate: new Date(),
    endDate: new Date(),
    formattedDate: "2025-01-01",
    location: "L",
    imageUrl: "https://x.com/e.jpg",
    featured: true,
    published: true,
  });

describe("SequelizeEventRepository", () => {
  const repo = new SequelizeEventRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create", async () => {
    (EventModel.create as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.create(makeEntity());
    expect(out.id).toBe(7);
  });

  it("findById null e ok", async () => {
    (EventModel.findByPk as jest.Mock).mockResolvedValueOnce(null);
    expect(await repo.findById(1)).toBeNull();
    (EventModel.findByPk as jest.Mock).mockResolvedValueOnce({ ...row });
    expect((await repo.findById(7))?.name).toBe("Fest");
  });

  it("update null quando registro não existe", async () => {
    (EventModel.findByPk as jest.Mock).mockResolvedValueOnce(null);
    expect(await repo.update(7, { name: "X" })).toBeNull();
  });

  it("update aplica patch e retorna entidade", async () => {
    const found: Record<string, unknown> = { ...row };
    (found as { update: jest.Mock }).update = jest
      .fn()
      .mockImplementation(async (patch: Record<string, unknown>) => {
        Object.assign(found, patch);
      });
    (EventModel.findByPk as jest.Mock).mockResolvedValueOnce(found);
    const out = await repo.update(7, { name: "Novo" });
    expect(out?.name).toBe("Novo");
  });

  it("delete", async () => {
    (EventModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(7)).toBe(true);
  });

  it("list com paginação", async () => {
    (EventModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [{ ...row }],
      count: 1,
    });
    const out = await repo.list({
      page: 1,
      limit: 10,
      filters: {},
      sort: { by: "createdAt", dir: "desc" },
    });
    expect(out.items).toHaveLength(1);
    expect(out.total).toBe(1);
    expect(out.page).toBe(1);
  });
});
