import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import {
  GetSettingByKeyRepository,
  ListSettingsRepository,
  UpsertSettingRepository,
} from "@/modules/settings/domain/repositories";
import { settingModelToEntity } from "../mappers/setting-model.mapper";
import { SettingModel } from "../model/setting-model";

export class SequelizeSettingRepository
  implements GetSettingByKeyRepository, ListSettingsRepository, UpsertSettingRepository
{
  async getByKey(key: string): Promise<SettingEntity | null> {
    const setting = await SettingModel.findOne({ where: { key } });
    if (!setting) return null;
    return settingModelToEntity(setting);
  }

  async list(): Promise<SettingEntity[]> {
    const settings = await SettingModel.findAll({ order: [["key", "ASC"]] });
    return settings.map((setting) => settingModelToEntity(setting));
  }

  async upsert(key: string, value: unknown): Promise<SettingEntity> {
    const existing = await SettingModel.findOne({ where: { key } });

    if (!existing) {
      const created = await SettingModel.create({ key, value });
      return settingModelToEntity(created);
    }

    existing.set("value", value);
    await existing.save();
    return settingModelToEntity(existing);
  }
}
