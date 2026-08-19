// src/core/domain/specification/specification-builder.ts
import { Specification } from "./specification";
import { and } from "./builders";

type SpecFactory<TParams> = (params: TParams) => Specification | null;

export class SpecificationBuilder<TParams extends object> {
  private readonly factories: SpecFactory<TParams>[] = [];

  add(factory: SpecFactory<TParams>): this {
    this.factories.push(factory);
    return this;
  }

  build(params: TParams): Specification | undefined {
    const specs = this.factories
      .map((fn) => fn(params))
      .filter((s): s is Specification => Boolean(s));

    if (specs.length === 0) return undefined;
    if (specs.length === 1) return specs[0];
    return and(...specs);
  }
}
