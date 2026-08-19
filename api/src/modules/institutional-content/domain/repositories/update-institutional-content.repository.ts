import { InstitutionalContentEntity } from "../entities/institutional-content.entity";

export interface UpdateInstitutionalContentRepository {
  update(
    id: number,
    entity: Partial<InstitutionalContentEntity>,
  ): Promise<InstitutionalContentEntity | null>;
}
