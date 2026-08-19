export interface DeleteInstitutionalContentRepository {
  delete(id: number): Promise<boolean>;
}
