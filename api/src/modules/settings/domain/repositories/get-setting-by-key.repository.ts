import { SettingEntity } from "../entities/setting.entity";

export interface GetSettingByKeyRepository {
  getByKey(key: string): Promise<SettingEntity | null>;
}
