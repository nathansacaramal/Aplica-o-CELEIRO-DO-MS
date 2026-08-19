import { QuerySpecification } from "../../domain/specifications/query-specification";
import { eq, like, touristPointCityIdInState } from "../../domain/specifications/factories";

export class TouristPointSpecificationBuilder {
  private specs: QuerySpecification[] = [];

  withName(name?: string) {
    if (name) this.specs.push(like("name", name));
    return this;
  }

  withCity(citySlug?: string) {
    if (citySlug) this.specs.push(eq("citySlug", citySlug));
    return this;
  }

  withState(state?: string) {
    if (state) this.specs.push(touristPointCityIdInState(state));
    return this;
  }

  withPublished(published?: boolean) {
    if (published !== undefined) this.specs.push(eq("published", published));
    return this;
  }

  // withPrecoRange(min?: number, max?: number) {
  //   if (min !== undefined && max !== undefined) {
  //     this.specs.push(between("preco", min, max));
  //   }
  //   return this;
  // }

  build(): QuerySpecification | null {
    if (this.specs.length === 0) return null;

    return this.specs.reduce((acc, spec) => acc.and(spec));
  }
}
