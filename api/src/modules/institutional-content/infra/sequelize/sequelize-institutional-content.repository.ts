import { InstitutionalContentEntity } from "../../domain/entities/institutional-content.entity";
import { CreateInstitutionalContentRepository } from "../../domain/repositories/create-institutional-content.repository";
import { DeleteInstitutionalContentRepository } from "../../domain/repositories/delete-institutional-content.repository";
import { FindInstitutionalContentByIdRepository } from "../../domain/repositories/find-institutional-content-by-id.repository";
import { GetInstitutionalContentRepository } from "../../domain/repositories/get-institutional-content.repository";
import { UpdateInstitutionalContentRepository } from "../../domain/repositories/update-institutional-content.repository";
import InstitutionalContentModel from "../model/institutional-content-model";

export class SequelizeInstitutionalContentRepository
  implements
    CreateInstitutionalContentRepository,
    DeleteInstitutionalContentRepository,
    FindInstitutionalContentByIdRepository,
    GetInstitutionalContentRepository,
    UpdateInstitutionalContentRepository
{
  async delete(id: number): Promise<boolean> {
    const deleted = await InstitutionalContentModel.destroy({ where: { id } });
    return deleted > 0;
  }
  async findById(id: number): Promise<InstitutionalContentEntity | null> {
    const result = await InstitutionalContentModel.findByPk(id);
    if (!result) return null;
    return this.toEntity(result);
  }
  async getAll(): Promise<InstitutionalContentEntity[] | null> {
    const result = await InstitutionalContentModel.findAll();
    return result.map((item) => this.toEntity(item));
  }
  async update(
    id: number,
    entity: Partial<InstitutionalContentEntity>,
  ): Promise<InstitutionalContentEntity | null> {
    const found = await InstitutionalContentModel.findByPk(id);
    if (!found) return null;

    await found.update({
      aboutTitle: entity.aboutTitle ?? found.aboutTitle,
      aboutText: entity.aboutText ?? found.aboutText,
      whoWeAreTitle: entity.whoWeAreTitle ?? found.whoWeAreTitle,
      WhoWeAreText: entity.whoWeAreText ?? (found as any).WhoWeAreText,
      purposeTitle: entity.purposeTitle ?? found.purposeTitle,
      purposeText: entity.purposeText ?? found.purposeText,
      mission: entity.mission ?? found.mission,
      vision: entity.vision ?? found.vision,
      valuesJson: entity.valuesJson ?? found.valuesJson,
    });

    return this.toEntity(found);
  }
  async create(entity: InstitutionalContentEntity): Promise<InstitutionalContentEntity | null> {
    const result = await InstitutionalContentModel.create({
      aboutTitle: entity.aboutTitle,
      aboutText: entity.aboutText,
      whoWeAreTitle: entity.whoWeAreTitle,
      WhoWeAreText: entity.whoWeAreText,
      purposeTitle: entity.purposeTitle,
      purposeText: entity.purposeText,
      mission: entity.mission,
      vision: entity.vision,
      valuesJson: entity.valuesJson,
    });

    return this.toEntity(result);
  }

  private toEntity(result: any): InstitutionalContentEntity {
    return new InstitutionalContentEntity({
      id: result.id,
      aboutTitle: result.aboutTitle,
      aboutText: result.aboutText,
      whoWeAreTitle: result.whoWeAreTitle,
      whoWeAreText: result.WhoWeAreText,
      purposeTitle: result.purposeTitle,
      purposeText: result.purposeText,
      mission: result.mission,
      vision: result.vision,
      valuesJson: result.valuesJson,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }
}
