import { MaintenanceModeValue } from "@/modules/settings/application/dto";
import { GetSettingByKeyRepository } from "@/modules/settings/domain/repositories/get-setting-by-key.repository";

export const MAINTENANCE_MODE_KEY = "maintenance_mode";

/**
 * Único ponto exposto publicamente do módulo de configurações: lê apenas a
 * chave "maintenance_mode" (nunca a tabela inteira) e sempre retorna um
 * valor, mesmo se o registro não existir — o site público nunca deve travar
 * por causa de uma configuração ausente.
 */
export class GetPublicMaintenanceModeUseCase {
  constructor(private readonly getSettingByKeyRepository: GetSettingByKeyRepository) {}

  async execute(): Promise<MaintenanceModeValue> {
    const setting = await this.getSettingByKeyRepository.getByKey(MAINTENANCE_MODE_KEY);
    const value = setting?.value as Partial<MaintenanceModeValue> | undefined;

    return { enabled: value?.enabled === true };
  }
}
