import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { GetSettingByKeyRepository } from "@/modules/settings/domain/repositories/get-setting-by-key.repository";

export class GetSettingUseCase {
  constructor(private readonly getSettingByKeyRepository: GetSettingByKeyRepository) {}

  async execute(key: string): Promise<SettingEntity | null> {
    return this.getSettingByKeyRepository.getByKey(key);
  }
}
