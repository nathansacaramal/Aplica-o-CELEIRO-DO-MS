import { GetInstitutionalContentUseCase } from "@/modules/institutional-content/application/use-cases/get-institutional-content.usecase";
import { InstitutionalContentEntity } from "@/modules/institutional-content/domain/entities/institutional-content.entity";
import { GetInstitutionalContentRepository } from "@/modules/institutional-content/domain/repositories/get-institutional-content.repository";

describe("GetInstitutionalContentUseCase", () => {
  it("delega ao repositório", async () => {
    const row = new InstitutionalContentEntity({
      id: 1,
      aboutTitle: "a",
      aboutText: "b",
      whoWeAreTitle: "c",
      whoWeAreText: "d",
      purposeTitle: "e",
      purposeText: "f",
      mission: "g",
      vision: "h",
      valuesJson: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo: GetInstitutionalContentRepository = {
      getAll: jest.fn(async () => [row]),
    };
    const sut = new GetInstitutionalContentUseCase(repo);
    const result = await sut.execute();
    expect(repo.getAll).toHaveBeenCalled();
    expect(result).toEqual([row]);
  });
});
