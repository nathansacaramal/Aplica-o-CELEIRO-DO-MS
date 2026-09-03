import { InstitutionalContentEntity } from "@/modules/institutional-content/domain/entities/institutional-content.entity";

/**
 * Achata a entidade para o corpo JSON plano do contrato (campos no topo, sem o
 * wrapper `props`). Fonte única para create/get/update — foi a divergência entre
 * o update (que devolvia a entidade crua) e os demais que fazia os dados
 * "sumirem" no formulário admin após salvar.
 */
export function toInstitutionalContentHttpPayload(entity: InstitutionalContentEntity) {
  return {
    id: entity.id,
    aboutTitle: entity.aboutTitle,
    aboutText: entity.aboutText,
    whoWeAreTitle: entity.whoWeAreTitle,
    whoWeAreText: entity.whoWeAreText,
    purposeTitle: entity.purposeTitle,
    purposeText: entity.purposeText,
    mission: entity.mission,
    vision: entity.vision,
    valuesJson: entity.valuesJson,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
