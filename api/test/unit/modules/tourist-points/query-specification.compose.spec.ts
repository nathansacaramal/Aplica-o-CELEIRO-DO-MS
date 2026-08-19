import { Op } from "sequelize";
import {
  between,
  eq,
  inList,
  like,
} from "@/modules/tourist-points/domain/specifications/factories";

describe("QuerySpecification compose (domain)", () => {
  it("and combina dois eq em Op.and", () => {
    const spec = eq("city", "CG").and(eq("published", true));
    expect(spec.toWhere()).toEqual({
      [Op.and]: [{ city: "CG" }, { published: true }],
    });
  });

  it("or combina especificações", () => {
    const spec = eq("a", 1).or(eq("b", 2));
    expect(spec.toWhere()).toEqual({
      [Op.or]: [{ a: 1 }, { b: 2 }],
    });
  });

  it("not envolve condição", () => {
    const spec = eq("flag", false).not();
    expect(spec.toWhere()).toEqual({
      [Op.not]: { flag: false },
    });
  });

  it("like gera Op.like", () => {
    expect(like("name", "x").toWhere()).toEqual({
      name: { [Op.like]: "%x%" },
    });
  });

  it("between gera Op.between", () => {
    expect(between("preco", 1, 10).toWhere()).toEqual({
      preco: { [Op.between]: [1, 10] },
    });
  });

  it("inList gera Op.in", () => {
    expect(inList("id", [1, 2]).toWhere()).toEqual({
      id: { [Op.in]: [1, 2] },
    });
  });
});
