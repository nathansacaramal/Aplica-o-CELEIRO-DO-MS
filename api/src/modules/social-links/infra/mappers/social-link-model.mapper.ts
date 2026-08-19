import { SocialLinkEntity } from "../../domain/entities/social-link.entity";
import SocialMediaLinksModel from "../model/social-links-model";

export function socialLinkModelToEntity(model: SocialMediaLinksModel): SocialLinkEntity {
  return new SocialLinkEntity({
    id: model.id,
    platform: model.platform,
    label: model.label,
    url: model.url,
    active: Boolean(model.active),
    order: Number(model.order),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  });
}
