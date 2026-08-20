import { SettingEntity } from "../entities/setting.entity";

export interface UpsertSettingRepository {
  upsert(key: string, value: unknown): Promise<SettingEntity>;
}
