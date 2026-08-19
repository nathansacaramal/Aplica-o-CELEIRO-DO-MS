import { socialLinkModelToEntity } from "../mappers/social-link-model.mapper";
import SocialMediaLinksModel from "../model/social-links-model";
import { SocialLinkEntity } from "../../domain/entities/social-link.entity";
import { CreateSocialLinkRepository } from "../../domain/repositories/create-social-link.repository";
import { DeleteSocialLinkRepository } from "../../domain/repositories/delete-social-link.repository";
import { FindSocialLinkByIdRepository } from "../../domain/repositories/find-social-link-by-id.repository";
import { GetSocialLinkRepository } from "../../domain/repositories/get-social-link.repository";
import { UpdateSocialLinkRepository } from "../../domain/repositories/update-social-link.repository";

export class SequelizeSocialLinkRepository
  implements
    CreateSocialLinkRepository,
    DeleteSocialLinkRepository,
    FindSocialLinkByIdRepository,
    GetSocialLinkRepository,
    UpdateSocialLinkRepository
{
  async create(entity: SocialLinkEntity): Promise<SocialLinkEntity | null> {
    const created = await SocialMediaLinksModel.create({
      platform: entity.platform,
      label: entity.label,
      url: entity.url,
      active: entity.active,
      order: entity.order,
    });

    return socialLinkModelToEntity(created);
  }

  async getAll(): Promise<SocialLinkEntity[] | null> {
    const links = await SocialMediaLinksModel.findAll({
      order: [["order", "ASC"]],
    });

    return links.map((link) => socialLinkModelToEntity(link));
  }

  async findById(id: number): Promise<SocialLinkEntity | null> {
    const link = await SocialMediaLinksModel.findByPk(id);
    if (!link) return null;
    return socialLinkModelToEntity(link);
  }

  async update(id: number, entity: SocialLinkEntity): Promise<SocialLinkEntity | null> {
    const link = await SocialMediaLinksModel.findByPk(id);
    if (!link) return null;

    await link.update({
      platform: entity.platform,
      label: entity.label,
      url: entity.url,
      active: entity.active,
      order: entity.order,
    });

    return socialLinkModelToEntity(link);
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await SocialMediaLinksModel.destroy({ where: { id } });
    return deleted > 0;
  }
}
