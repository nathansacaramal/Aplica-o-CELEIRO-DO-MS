import { Controller } from "@/core/protocols";
import { getPublicWebImageUploader } from "@/modules/media/infra/factories/compose-public-web-image-uploader";
import {
  GetPublicMaintenanceModeUseCase,
  GetPublicSiteLogoUseCase,
  GetSettingUseCase,
  ListSettingsUseCase,
  UpdateSettingUseCase,
  UpdateSiteLogoUseCase,
} from "@/modules/settings/application/use-cases";
import { SequelizeSettingRepository } from "@/modules/settings/infra/sequelize/sequelize-setting.repository";
import {
  GetPublicMaintenanceModeController,
  GetPublicSiteLogoController,
  GetSettingController,
  ListSettingsController,
  UpdateSettingController,
  UpdateSiteLogoController,
} from "../controller";

const settingRepo = new SequelizeSettingRepository();
const images = getPublicWebImageUploader();

const listSettingsUseCase = new ListSettingsUseCase(settingRepo);
const getSettingUseCase = new GetSettingUseCase(settingRepo);
const updateSettingUseCase = new UpdateSettingUseCase(settingRepo);
const getPublicMaintenanceModeUseCase = new GetPublicMaintenanceModeUseCase(settingRepo);
const updateSiteLogoUseCase = new UpdateSiteLogoUseCase(settingRepo, settingRepo, images);
const getPublicSiteLogoUseCase = new GetPublicSiteLogoUseCase(settingRepo);

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

export function makeUpdateSiteLogoController(): Controller {
  return new UpdateSiteLogoController(updateSiteLogoUseCase);
}

export function makeGetPublicSiteLogoController(): Controller {
  return new GetPublicSiteLogoController(getPublicSiteLogoUseCase);
}
