import { Op } from "sequelize";
import { TouristPointSpecificationBuilder } from "@/modules/tourist-points/application/specifications/tourist-point-spec.builder";

describe("TouristPointSpecificationBuilder", () => {
  it("build retorna null quando nenhum filtro foi aplicado", () => {
    const spec = new TouristPointSpecificationBuilder().build();
    expect(spec).toBeNull();
  });

  it("withName aplica LIKE no campo name", () => {
    const spec = new TouristPointSpecificationBuilder().withName("Museu").build();
    expect(spec).not.toBeNull();
    const where = spec!.toWhere() as Record<string, unknown>;
    expect(where).toEqual({
      name: { [Op.like]: "%Museu%" },
    });
  });

  it("withCity aplica igualdade", () => {
    const spec = new TouristPointSpecificationBuilder().withCity("campo-grande").build();
    expect(spec!.toWhere()).toEqual({ citySlug: "campo-grande" });
  });

  it("withState aplica filtro de cidade pelo estado", () => {
    const spec = new TouristPointSpecificationBuilder().withState("MS").build();
    expect(spec!.toWhere()).toEqual({
      cityId: { [Op.in]: { val: "(SELECT id FROM `cities` WHERE state = 'MS')" } },
    });
  });

  it("withPublished false inclui filtro published", () => {
    const spec = new TouristPointSpecificationBuilder().withPublished(false).build();
    expect(spec!.toWhere()).toEqual({ published: false });
  });

  it("withPublished true inclui filtro", () => {
    const spec = new TouristPointSpecificationBuilder().withPublished(true).build();
    expect(spec!.toWhere()).toEqual({ published: true });
  });

  it("withPublished undefined não adiciona spec", () => {
    const spec = new TouristPointSpecificationBuilder().withPublished(undefined).build();
    expect(spec).toBeNull();
  });

  it("combina múltiplos filtros com AND (reduce aninha Op.and)", () => {
    const spec = new TouristPointSpecificationBuilder()
      .withName("Parque")
      .withCity("CG")
      .withState("MS")
      .withPublished(true)
      .build();

    const where = spec!.toWhere() as { [key: symbol]: unknown };
    expect(where[Op.and]).toBeDefined();
    expect(Array.isArray(where[Op.and])).toBe(true);
  });

  it("ignora string vazia em withName (falsy)", () => {
    const spec = new TouristPointSpecificationBuilder().withName("").build();
    expect(spec).toBeNull();
  });
});
