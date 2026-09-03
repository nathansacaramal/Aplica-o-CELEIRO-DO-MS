import {
  isPublicNavItemId,
  PUBLIC_NAV_KEY,
  PublicNavItemId,
  PublicNavValue,
} from "@/modules/settings/application/dto";
import { GetSettingByKeyRepository } from "@/modules/settings/domain/repositories/get-setting-by-key.repository";

/**
 * Único ponto exposto publicamente para a visibilidade do menu: lê apenas a
 * chave "public_nav" e devolve sempre uma lista utilizável. Chave ausente,
 * valor malformado ou ids desconhecidos resultam em `hidden: []` — ou seja,
 * o menu público completo, nunca um menu vazio por causa de configuração.
 */
export class GetPublicNavUseCase {
  constructor(private readonly getSettingByKeyRepository: GetSettingByKeyRepository) {}

  async execute(): Promise<PublicNavValue> {
    const setting = await this.getSettingByKeyRepository.getByKey(PUBLIC_NAV_KEY);
    const value = setting?.value as Partial<PublicNavValue> | undefined;

    if (!Array.isArray(value?.hidden)) {
      return { hidden: [] };
    }

    const hidden = value.hidden.filter((item): item is PublicNavItemId => isPublicNavItemId(item));

    return { hidden: [...new Set(hidden)] };
  }
}
