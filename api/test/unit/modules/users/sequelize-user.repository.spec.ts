import UserModel from "@/modules/users/infra/model/user-model";
import { SequelizeUserRepository } from "@/modules/users/infra/sequelize/sequelize-user.repository";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

jest.mock("@/modules/users/infra/model/user-model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sync: jest.fn().mockResolvedValue(undefined),
  },
}));

const row = {
  id: 9,
  name: "U",
  email: "u@b.com",
  password: "hash",
  role: "Admin",
};

describe("SequelizeUserRepository", () => {
  const repo = new SequelizeUserRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create", async () => {
    (UserModel.create as jest.Mock).mockResolvedValue({ ...row });
    const u = new UserEntity({
      name: "U",
      email: "u@b.com",
      password: "p",
      role: "Admin",
    });
    const out = await repo.create(u);
    expect(out.id).toBe(9);
    expect(UserModel.sync).toHaveBeenCalled();
  });

  it("findById", async () => {
    (UserModel.findByPk as jest.Mock).mockResolvedValue(null);
    expect(await repo.findById(1)).toBeNull();
    (UserModel.findByPk as jest.Mock).mockResolvedValue({ ...row });
    expect((await repo.findById(9))?.email).toBe("u@b.com");
  });

  it("findByEmail", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ ...row });
    expect((await repo.findByEmail("u@b.com"))?.id).toBe(9);
  });

  it("list paginado", async () => {
    (UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [{ ...row }],
      count: 1,
    });
    const out = await repo.list({
      page: 1,
      limit: 10,
      sortBy: "name",
      sortDir: "asc",
    });
    expect(out.items.length).toBe(1);
    expect(out.total).toBe(1);
    expect(UserModel.findAndCountAll).toHaveBeenCalled();
  });

  it("update", async () => {
    const inst = {
      id: 9,
      name: "U",
      email: "u@b.com",
      password: "h",
      role: "Admin" as const,
      update: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
        Object.assign(inst, data);
      }),
    };
    (UserModel.findByPk as jest.Mock).mockResolvedValue(inst);
    const out = await repo.update(9, { name: "Novo" });
    expect(inst.update).toHaveBeenCalled();
    expect(out?.name).toBe("Novo");
  });

  it("delete", async () => {
    (UserModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(9)).toBe(true);
  });

  it("findByTelefone null e encontrado", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    expect(await repo.findByTelefone("999")).toBeNull();
    (UserModel.findOne as jest.Mock).mockResolvedValue({ ...row, telefone: "999" });
    const out = await repo.findByTelefone("999");
    expect(out?.userId).toBe(9);
    expect(out?.endereco).toBe("Endereço não informado");
  });
});
