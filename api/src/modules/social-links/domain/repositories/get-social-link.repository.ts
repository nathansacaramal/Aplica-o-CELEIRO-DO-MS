import { SocialLinkEntity } from "../entities/social-link.entity";

export interface GetSocialLinkRepository {
  getAll(): Promise<SocialLinkEntity[] | null>;
}
