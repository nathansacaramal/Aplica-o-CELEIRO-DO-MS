import { Controller } from "@/core/protocols";
import {
  GetPublicMaintenanceModeUseCase,
  GetSettingUseCase,
  ListSettingsUseCase,
  UpdateSettingUseCase,
} from "@/modules/settings/application/use-cases";
import { SequelizeSettingRepository } from "@/modules/settings/infra/sequelize/sequelize-setting.repository";
import {
  GetPublicMaintenanceModeController,
  GetSettingController,
  ListSettingsController,
  UpdateSettingController,
} from "../controller";

const settingRepo = new SequelizeSettingRepository();

const listSettingsUseCase = new ListSettingsUseCase(settingRepo);
const getSettingUseCase = new GetSettingUseCase(settingRepo);
const updateSettingUseCase = new UpdateSettingUseCase(settingRepo);
const getPublicMaintenanceModeUseCase = new GetPublicMaintenanceModeUseCase(settingRepo);

export function makeListSettingsController(): Controller {
  return new ListSettingsController(listSettingsUseCase);
}

export function makeGetSettingController(): Controller {
  return new GetSettingController(getSettingUseCase);
}

export function makeUpdateSettingController(): Controller {
  return new UpdateSettingController(updateSettingUseCase);
}

export function makeGetPublicMaintenanceModeController(): Controller {
  return new GetPublicMaintenanceModeController(getPublicMaintenanceModeUseCase);
}
