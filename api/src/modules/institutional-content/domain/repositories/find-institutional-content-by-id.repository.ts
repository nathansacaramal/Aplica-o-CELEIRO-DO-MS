import { InstitutionalContentEntity } from "../entities/institutional-content.entity";

export interface FindInstitutionalContentByIdRepository {
  findById(id: number): Promise<InstitutionalContentEntity | null>;
}
