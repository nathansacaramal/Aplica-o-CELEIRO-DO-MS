// src/core/domain/specification/builders.ts
import { AndSpecification, OrSpecification, NotSpecification } from "./composite.specification";
import {
  EqSpecification,
  LikeSpecification,
  InSpecification,
  BetweenSpecification,
} from "./leaves";
import { Specification } from "./specification";

export const and = (...specs: Specification[]) => new AndSpecification(specs);
export const or = (...specs: Specification[]) => new OrSpecification(specs);
export const not = (spec: Specification) => new NotSpecification(spec);

export const eq = (field: string, value: any) => new EqSpecification(field, value);
export const like = (field: string, value: string) => new LikeSpecification(field, value);
export const inList = (field: string, values: any[]) => new InSpecification(field, values);
export const between = (field: string, from: any, to: any) =>
  new BetweenSpecification(field, from, to);
