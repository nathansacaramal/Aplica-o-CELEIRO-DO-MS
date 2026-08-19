import { SocialLinkEntity } from "../entities/social-link.entity";

export interface FindSocialLinkByIdRepository {
  findById(id: number): Promise<SocialLinkEntity | null>;
}
