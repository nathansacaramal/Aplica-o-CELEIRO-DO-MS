import { InstitutionalContentEntity } from "../entities/institutional-content.entity";

export interface CreateInstitutionalContentRepository {
  create(entity: InstitutionalContentEntity): Promise<InstitutionalContentEntity | null>;
}
