import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { ListSettingsRepository } from "@/modules/settings/domain/repositories/list-settings.repository";

export class ListSettingsUseCase {
  constructor(private readonly listSettingsRepository: ListSettingsRepository) {}

  async execute(): Promise<SettingEntity[]> {
    return this.listSettingsRepository.list();
  }
}
