import { UpdateSettingDTO } from "@/modules/settings/application/dto";
import { SettingEntity } from "@/modules/settings/domain/entities/setting.entity";
import { UpsertSettingRepository } from "@/modules/settings/domain/repositories/upsert-setting.repository";

export class UpdateSettingUseCase {
  constructor(private readonly upsertSettingRepository: UpsertSettingRepository) {}

  async execute(key: string, dto: UpdateSettingDTO): Promise<SettingEntity> {
    return this.upsertSettingRepository.upsert(key, dto.value);
  }
}
