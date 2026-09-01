import {
  DEFAULT_SITE_LOGO_URL,
  SITE_LOGO_KEY,
  SiteLogoValue,
} from "@/modules/settings/application/dto";
import { GetSettingByKeyRepository } from "@/modules/settings/domain/repositories/get-setting-by-key.repository";

/**
 * Único ponto exposto publicamente para a logo: lê apenas a chave
 * "site_logo" e sempre retorna uma URL utilizável — se a configuração ainda
 * não existir ou estiver malformada, cai na logo estática atual do site
 * (`DEFAULT_SITE_LOGO_URL`) em vez de deixar o público sem logo.
 */
export class GetPublicSiteLogoUseCase {
  constructor(private readonly getSettingByKeyRepository: GetSettingByKeyRepository) {}

  async execute(): Promise<SiteLogoValue> {
    const setting = await this.getSettingByKeyRepository.getByKey(SITE_LOGO_KEY);
    const value = setting?.value as Partial<SiteLogoValue> | undefined;
    const url = typeof value?.url === "string" && value.url.trim() !== "" ? value.url : DEFAULT_SITE_LOGO_URL;

    return { url };
  }
}
