import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import type { WebImagePayload } from "@/modules/media/domain/value-objects/web-image-payload";
import { SITE_LOGO_KEY, SiteLogoValue } from "@/modules/settings/application/dto";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { GetSettingByKeyRepository } from "@/modules/settings/domain/repositories/get-setting-by-key.repository";
import { UpsertSettingRepository } from "@/modules/settings/domain/repositories/upsert-setting.repository";

export class UpdateSiteLogoUseCase {
  constructor(
    private readonly getSettingByKeyRepository: GetSettingByKeyRepository,
    private readonly upsertSettingRepository: UpsertSettingRepository,
    private readonly images: PublicWebImageUploader,
  ) {}

  async execute(image: WebImagePayload): Promise<SettingEntity> {
    const existing = await this.getSettingByKeyRepository.getByKey(SITE_LOGO_KEY);
    const previousUrl = (existing?.value as Partial<SiteLogoValue> | undefined)?.url ?? null;

    const { url } = await this.images.replacePublicWebImage(previousUrl, image, "settings");

    return this.upsertSettingRepository.upsert(SITE_LOGO_KEY, { url } satisfies SiteLogoValue);
  }
}
