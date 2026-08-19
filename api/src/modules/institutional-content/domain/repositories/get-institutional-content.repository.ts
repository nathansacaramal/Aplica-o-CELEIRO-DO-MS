import { InstitutionalContentEntity } from "../entities/institutional-content.entity";

export interface GetInstitutionalContentRepository {
  getAll(): Promise<InstitutionalContentEntity[] | null>;
}
