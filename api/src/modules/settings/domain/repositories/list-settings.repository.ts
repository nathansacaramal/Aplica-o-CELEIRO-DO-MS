import { SettingEntity } from "../entities/setting.entity";

export interface ListSettingsRepository {
  list(): Promise<SettingEntity[]>;
}
