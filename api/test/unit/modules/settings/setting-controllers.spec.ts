import { GetPublicMaintenanceModeController } from "@/modules/settings/presentation/http/controller/get-public-maintenance-mode.controller";
import { GetPublicNavController } from "@/modules/settings/presentation/http/controller/get-public-nav.controller";
import { GetPublicSiteLogoController } from "@/modules/settings/presentation/http/controller/get-public-site-logo.controller";
import { GetSettingController } from "@/modules/settings/presentation/http/controller/get-setting.controller";
import { ListSettingsController } from "@/modules/settings/presentation/http/controller/list-settings.controller";
import { UpdateSettingController } from "@/modules/settings/presentation/http/controller/update-setting.controller";
import { UpdateSiteLogoController } from "@/modules/settings/presentation/http/controller/update-site-logo.controller";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const setting = new SettingEntity({
  id: 1,
  key: "maintenance_mode",
  value: { enabled: false },
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

describe("ListSettingsController", () => {
  const execute = jest.fn();
  const sut = new ListSettingsController({ execute } as never);

  it("200 lista", async () => {
    execute.mockResolvedValue([setting]);
    expect((await sut.handle({ correlationId: "c" })).statusCode).toBe(200);
  });

  it("erro inesperado", async () => {
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c" })).statusCode).not.toBe(200);
  });
});

describe("GetSettingController", () => {
  const execute = jest.fn();
  const sut = new GetSettingController({ execute } as never);

  it("404 quando não encontrado", async () => {
    execute.mockResolvedValue(null);
    const r = await sut.handle({ correlationId: "c", params: { key: "x" } });
    expect(r.statusCode).toBe(404);
    expect(r.body).toMatchObject({ error: { code: "SETTING_NOT_FOUND" } });
  });

  it("200 quando encontrado", async () => {
    execute.mockResolvedValue(setting);
    const r = await sut.handle({ correlationId: "c", params: { key: "maintenance_mode" } });
    expect(r.statusCode).toBe(200);
  });
});

describe("UpdateSettingController", () => {
  const execute = jest.fn();
  const sut = new UpdateSettingController({ execute } as never);

  it("200 e repassa key/body ao use-case", async () => {
    execute.mockResolvedValue(setting);
    const r = await sut.handle({
      correlationId: "c",
      params: { key: "maintenance_mode" },
      body: { value: { enabled: true } },
    });
    expect(r.statusCode).toBe(200);
    expect(execute).toHaveBeenCalledWith("maintenance_mode", { value: { enabled: true } });
  });

  it("erro inesperado", async () => {
    execute.mockRejectedValue(new Error("x"));
    const r = await sut.handle({
      correlationId: "c",
      params: { key: "maintenance_mode" },
      body: { value: { enabled: true } },
    });
    expect(r.statusCode).not.toBe(200);
  });
});

describe("GetPublicMaintenanceModeController", () => {
  const execute = jest.fn();
  const sut = new GetPublicMaintenanceModeController({ execute } as never);

  it("200 com o payload do use-case", async () => {
    execute.mockResolvedValue({ enabled: true });
    const r = await sut.handle({ correlationId: "c" });
    expect(r.statusCode).toBe(200);
  });

  it("erro inesperado", async () => {
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c" })).statusCode).not.toBe(200);
  });
});

const logoSetting = new SettingEntity({
  id: 2,
  key: "site_logo",
  value: { url: "https://cdn.example/logo.png" },
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

describe("UpdateSiteLogoController", () => {
  const execute = jest.fn();
  const sut = new UpdateSiteLogoController({ execute } as never);

  it("200 e repassa a imagem ao use-case", async () => {
    execute.mockResolvedValue(logoSetting);
    const image = { base64: "AAAA", mimeType: "image/png" };
    const r = await sut.handle({ correlationId: "c", body: { image } });
    expect(r.statusCode).toBe(200);
    expect(execute).toHaveBeenCalledWith(image);
  });

  it("erro inesperado", async () => {
    execute.mockRejectedValue(new Error("x"));
    const r = await sut.handle({
      correlationId: "c",
      body: { image: { base64: "AAAA", mimeType: "image/png" } },
    });
    expect(r.statusCode).not.toBe(200);
  });
});

describe("GetPublicSiteLogoController", () => {
  const execute = jest.fn();
  const sut = new GetPublicSiteLogoController({ execute } as never);

  it("200 com o payload do use-case", async () => {
    execute.mockResolvedValue({ url: "/celeiro_ms_logo.jpg" });
    const r = await sut.handle({ correlationId: "c" });
    expect(r.statusCode).toBe(200);
  });

  it("erro inesperado", async () => {
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c" })).statusCode).not.toBe(200);
  });
});

describe("GetPublicNavController", () => {
  const execute = jest.fn();
  const sut = new GetPublicNavController({ execute } as never);

  it("200 com o payload do use-case", async () => {
    execute.mockResolvedValue({ hidden: ["hoteis"] });
    const r = await sut.handle({ correlationId: "c" });
    expect(r.statusCode).toBe(200);
    expect(r.body).toMatchObject({ data: { hidden: ["hoteis"] } });
  });

  it("erro inesperado", async () => {
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c" })).statusCode).not.toBe(200);
  });
});
