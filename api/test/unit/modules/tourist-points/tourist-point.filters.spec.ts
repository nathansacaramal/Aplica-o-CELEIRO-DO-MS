import {
  byCategoria,
  byCity,
  bySearch,
  byState,
} from "@/modules/tourist-points/domain/specs/tourist-point.filters";
import { EqSpecification } from "@/core/domain/specification/leaves";
import { LikeSpecification } from "@/core/domain/specification/leaves";

describe("tourist-point.filters", () => {
  it("bySearch retorna null sem busca e spec com texto", () => {
    expect(bySearch({})).toBeNull();
    expect(bySearch({ search: "   " })).toBeNull();
    const s = bySearch({ search: "  museu  " });
    expect(s).toBeInstanceOf(LikeSpecification);
  });

  it("byCity / byState", () => {
    expect(byCity({})).toBeNull();
    expect(byCity({ city: "  " })).toBeNull();
    expect(byCity({ city: " Campo " })).toBeInstanceOf(EqSpecification);

    expect(byState({})).toBeNull();
    expect(byState({ state: "MS" })).toBeInstanceOf(EqSpecification);
  });

  it("byCategoria", () => {
    expect(byCategoria({})).toBeNull();
    const s = byCategoria({ category: "parque" });
    expect(s).toBeInstanceOf(EqSpecification);
  });
});
