import { InstitutionalContentEntity } from "@/modules/institutional-content/domain/entities/institutional-content.entity";

describe("InstitutionalContentEntity", () => {
  it("expõe getters", () => {
    const d = new Date();
    const e = new InstitutionalContentEntity({
      id: 2,
      aboutTitle: "Sobre",
      aboutText: "Texto",
      whoWeAreTitle: "Quem",
      whoWeAreText: "Somos",
      purposeTitle: "Propósito",
      purposeText: "P texto",
      mission: "M",
      vision: "V",
      valuesJson: "[]",
      createdAt: d,
      updatedAt: d,
    });
    expect(e.id).toBe(2);
    expect(e.aboutTitle).toBe("Sobre");
    expect(e.whoWeAreText).toBe("Somos");
    expect(e.valuesJson).toBe("[]");
    expect(e.createdAt).toBe(d);
  });
});
