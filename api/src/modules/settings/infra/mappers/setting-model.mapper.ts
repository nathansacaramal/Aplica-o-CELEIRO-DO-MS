import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { SettingModel } from "../model/setting-model";

export function settingModelToEntity(model: SettingModel): SettingEntity {
  return new SettingEntity({
    id: model.id,
    key: model.key,
    value: model.value,
    updatedAt: model.updatedAt,
  });
}
