import { SettingModel } from "@/modules/settings/infra/model/setting-model";
import { SequelizeSettingRepository } from "@/modules/settings/infra/sequelize/sequelize-setting.repository";

jest.mock("@/modules/settings/infra/model/setting-model", () => ({
  SettingModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
}));

const row = {
  id: 1,
  key: "maintenance_mode",
  value: { enabled: false },
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("SequelizeSettingRepository", () => {
  const repo = new SequelizeSettingRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getByKey retorna null quando não encontrado", async () => {
    (SettingModel.findOne as jest.Mock).mockResolvedValue(null);
    expect(await repo.getByKey("x")).toBeNull();
  });

  it("getByKey retorna entidade quando encontrado", async () => {
    (SettingModel.findOne as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.getByKey("maintenance_mode");
    expect(out?.key).toBe("maintenance_mode");
    expect(out?.value).toEqual({ enabled: false });
  });

  it("list retorna todas as configurações ordenadas por key", async () => {
    (SettingModel.findAll as jest.Mock).mockResolvedValue([{ ...row }]);
    const out = await repo.list();
    expect(out).toHaveLength(1);
    expect(SettingModel.findAll).toHaveBeenCalledWith({ order: [["key", "ASC"]] });
  });

  it("upsert cria quando a chave ainda não existe", async () => {
    (SettingModel.findOne as jest.Mock).mockResolvedValue(null);
    (SettingModel.create as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.upsert("maintenance_mode", { enabled: false });
    expect(SettingModel.create).toHaveBeenCalledWith({
      key: "maintenance_mode",
      value: { enabled: false },
    });
    expect(out.key).toBe("maintenance_mode");
  });

  it("upsert atualiza quando a chave já existe", async () => {
    const set = jest.fn();
    const save = jest.fn().mockResolvedValue(undefined);
    (SettingModel.findOne as jest.Mock).mockResolvedValue({
      ...row,
      set,
      save,
    });
    const out = await repo.upsert("maintenance_mode", { enabled: true });
    expect(set).toHaveBeenCalledWith("value", { enabled: true });
    expect(save).toHaveBeenCalled();
    expect(out.key).toBe("maintenance_mode");
  });
});
