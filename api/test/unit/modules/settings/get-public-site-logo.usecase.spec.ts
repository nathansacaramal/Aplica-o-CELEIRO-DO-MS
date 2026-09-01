import { GetPublicSiteLogoUseCase } from "@/modules/settings/application/use-cases/get-public-site-logo.usecase";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";

describe("GetPublicSiteLogoUseCase", () => {
  it("retorna a url configurada quando a chave existe", async () => {
    const getByKey = jest
      .fn()
      .mockResolvedValue(new SettingEntity({ key: "site_logo", value: { url: "https://cdn.example/logo.png" } }));
    const sut = new GetPublicSiteLogoUseCase({ getByKey });

    expect(await sut.execute()).toEqual({ url: "https://cdn.example/logo.png" });
    expect(getByKey).toHaveBeenCalledWith("site_logo");
  });

  it("cai na logo estática padrão quando a configuração não existe", async () => {
    const getByKey = jest.fn().mockResolvedValue(null);
    const sut = new GetPublicSiteLogoUseCase({ getByKey });

    expect(await sut.execute()).toEqual({ url: "/celeiro_ms_logo.jpg" });
  });

  it("cai na logo estática padrão quando o valor armazenado está malformado", async () => {
    const getByKey = jest
      .fn()
      .mockResolvedValue(new SettingEntity({ key: "site_logo", value: { url: 123 } }));
    const sut = new GetPublicSiteLogoUseCase({ getByKey });

    expect(await sut.execute()).toEqual({ url: "/celeiro_ms_logo.jpg" });
  });
});
