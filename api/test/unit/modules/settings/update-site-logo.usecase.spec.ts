import { UpdateSiteLogoUseCase } from "@/modules/settings/application/use-cases/update-site-logo.usecase";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";

describe("UpdateSiteLogoUseCase", () => {
  const image = { base64: "AAAA", mimeType: "image/png" };

  it("substitui a imagem anterior quando já existe uma logo configurada", async () => {
    const getByKey = jest.fn().mockResolvedValue(
      new SettingEntity({ key: "site_logo", value: { url: "https://cdn.example/old.png" } }),
    );
    const upsert = jest.fn().mockResolvedValue(
      new SettingEntity({ key: "site_logo", value: { url: "https://cdn.example/new.png" } }),
    );
    const replacePublicWebImage = jest
      .fn()
      .mockResolvedValue({ url: "https://cdn.example/new.png" });
    const images = { uploadPublicWebImage: jest.fn(), replacePublicWebImage };

    const sut = new UpdateSiteLogoUseCase({ getByKey }, { upsert }, images);
    const out = await sut.execute(image);

    expect(replacePublicWebImage).toHaveBeenCalledWith(
      "https://cdn.example/old.png",
      image,
      "settings",
    );
    expect(upsert).toHaveBeenCalledWith("site_logo", { url: "https://cdn.example/new.png" });
    expect(out.value).toEqual({ url: "https://cdn.example/new.png" });
  });

  it("faz upload normalmente quando ainda não existe logo configurada (primeira vez)", async () => {
    const getByKey = jest.fn().mockResolvedValue(null);
    const upsert = jest.fn().mockResolvedValue(
      new SettingEntity({ key: "site_logo", value: { url: "https://cdn.example/first.png" } }),
    );
    const replacePublicWebImage = jest
      .fn()
      .mockResolvedValue({ url: "https://cdn.example/first.png" });
    const images = { uploadPublicWebImage: jest.fn(), replacePublicWebImage };

    const sut = new UpdateSiteLogoUseCase({ getByKey }, { upsert }, images);
    await sut.execute(image);

    expect(replacePublicWebImage).toHaveBeenCalledWith(null, image, "settings");
  });
});
