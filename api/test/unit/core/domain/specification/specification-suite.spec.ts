import { SpecificationBuilder } from "@/core/domain/specification/specification-builder";
import { Specification } from "@/core/domain/specification/specification";
import { and, between, eq, inList, like, not, or } from "@/core/domain/specification/builders";
import {
  BetweenSpecification,
  EqSpecification,
  InSpecification,
  LikeSpecification,
} from "@/core/domain/specification/leaves";
import {
  AndSpecification,
  NotSpecification,
  OrSpecification,
} from "@/core/domain/specification/composite.specification";

describe("specification core", () => {
  it("SpecificationBuilder retorna undefined sem specs", () => {
    const b = new SpecificationBuilder<{ x?: string }>();
    expect(b.build({})).toBeUndefined();
  });

  it("SpecificationBuilder combina com and", () => {
    const b = new SpecificationBuilder<{ n?: string }>();
    b.add((p) => (p.n ? eq("name", p.n) : null));
    b.add((p) => (p.n ? like("name", p.n) : null));
    const spec = b.build({ n: "a" });
    expect(spec).toBeInstanceOf(AndSpecification);
  });

  it("SpecificationBuilder uma spec só", () => {
    const b = new SpecificationBuilder<{ n?: string }>();
    b.add(() => eq("id", 1));
    const spec = b.build({});
    expect(spec).toBeInstanceOf(EqSpecification);
  });

  it("leaves geram where sequelize", () => {
    expect(new EqSpecification("a", 1).toSequelizeWhere()).toEqual({ a: 1 });
    expect(new LikeSpecification("n", "x").toSequelizeWhere()).toMatchObject({
      n: expect.objectContaining({}),
    });
    expect(new InSpecification("id", [1, 2]).toSequelizeWhere()).toMatchObject({
      id: expect.any(Object),
    });
    expect(new BetweenSpecification("d", 1, 2).toSequelizeWhere()).toMatchObject({
      d: expect.any(Object),
    });
  });

  it("composite and / or / not", () => {
    const a: Specification = eq("a", 1);
    const b: Specification = eq("b", 2);
    expect(and(a, b)).toBeInstanceOf(AndSpecification);
    expect(or(a, b)).toBeInstanceOf(OrSpecification);
    expect(not(a)).toBeInstanceOf(NotSpecification);
    expect(and(a, b).toSequelizeWhere()).toBeDefined();
    expect(or(a, b).toSequelizeWhere()).toBeDefined();
    expect(not(a).toSequelizeWhere()).toBeDefined();
  });

  it("helpers builders", () => {
    expect(eq("f", "v")).toBeInstanceOf(EqSpecification);
    expect(like("f", "v")).toBeInstanceOf(LikeSpecification);
    expect(inList("f", [1])).toBeInstanceOf(InSpecification);
    expect(between("f", 1, 2)).toBeInstanceOf(BetweenSpecification);
  });
});
