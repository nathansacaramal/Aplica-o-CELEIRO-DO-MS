import { SocialLinkEntity } from "../entities/social-link.entity";

export interface CreateSocialLinkRepository {
  create(entity: SocialLinkEntity): Promise<SocialLinkEntity | null>;
}
