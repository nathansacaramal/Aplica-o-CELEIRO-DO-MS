import { GetPublicMaintenanceModeUseCase } from "@/modules/settings/application/use-cases/get-public-maintenance-mode.usecase";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";

describe("GetPublicMaintenanceModeUseCase", () => {
  it("retorna enabled: true quando a configuração existe e está ativa", async () => {
    const getByKey = jest.fn().mockResolvedValue(
      new SettingEntity({ key: "maintenance_mode", value: { enabled: true } }),
    );
    const sut = new GetPublicMaintenanceModeUseCase({ getByKey });

    expect(await sut.execute()).toEqual({ enabled: true });
    expect(getByKey).toHaveBeenCalledWith("maintenance_mode");
  });

  it("retorna enabled: false quando a configuração existe e está desativada", async () => {
    const getByKey = jest.fn().mockResolvedValue(
      new SettingEntity({ key: "maintenance_mode", value: { enabled: false } }),
    );
    const sut = new GetPublicMaintenanceModeUseCase({ getByKey });

    expect(await sut.execute()).toEqual({ enabled: false });
  });

  it("nunca trava o site público: retorna enabled: false quando a configuração não existe", async () => {
    const getByKey = jest.fn().mockResolvedValue(null);
    const sut = new GetPublicMaintenanceModeUseCase({ getByKey });

    expect(await sut.execute()).toEqual({ enabled: false });
  });

  it("retorna enabled: false quando o valor armazenado está malformado", async () => {
    const getByKey = jest.fn().mockResolvedValue(
      new SettingEntity({ key: "maintenance_mode", value: { enabled: "yes" } }),
    );
    const sut = new GetPublicMaintenanceModeUseCase({ getByKey });

    expect(await sut.execute()).toEqual({ enabled: false });
  });
});
