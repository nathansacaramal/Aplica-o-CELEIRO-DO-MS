import { GetPublicNavUseCase } from "@/modules/settings/application/use-cases/get-public-nav.usecase";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";

function makeSut(value: unknown, exists = true) {
  const getByKey = jest
    .fn()
    .mockResolvedValue(exists ? new SettingEntity({ key: "public_nav", value }) : null);
  return { sut: new GetPublicNavUseCase({ getByKey }), getByKey };
}

describe("GetPublicNavUseCase", () => {
  it("retorna os itens escondidos configurados", async () => {
    const { sut, getByKey } = makeSut({ hidden: ["hoteis", "sobre"] });

    expect(await sut.execute()).toEqual({ hidden: ["hoteis", "sobre"] });
    expect(getByKey).toHaveBeenCalledWith("public_nav");
  });

  it("retorna menu completo quando a configuração não existe", async () => {
    const { sut } = makeSut(undefined, false);
    expect(await sut.execute()).toEqual({ hidden: [] });
  });

  it("retorna menu completo quando o valor está malformado", async () => {
    expect(await makeSut({ hidden: "hoteis" }).sut.execute()).toEqual({ hidden: [] });
    expect(await makeSut({}).sut.execute()).toEqual({ hidden: [] });
    expect(await makeSut(null).sut.execute()).toEqual({ hidden: [] });
  });

  it("descarta ids desconhecidos em vez de repassá-los ao front", async () => {
    const { sut } = makeSut({ hidden: ["hoteis", "rota-inexistente", 42, null] });
    expect(await sut.execute()).toEqual({ hidden: ["hoteis"] });
  });

  it("remove duplicados", async () => {
    const { sut } = makeSut({ hidden: ["blog", "blog", "cidades"] });
    expect(await sut.execute()).toEqual({ hidden: ["blog", "cidades"] });
  });
});
