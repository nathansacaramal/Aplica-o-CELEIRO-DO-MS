import { SocialLinkEntity } from "../entities/social-link.entity";

export interface UpdateSocialLinkRepository {
  update(id: number, __entity: SocialLinkEntity): Promise<SocialLinkEntity | null>;
}
