export interface DeleteSocialLinkRepository {
  delete(id: number): Promise<boolean>;
}
