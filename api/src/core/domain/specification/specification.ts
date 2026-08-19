// src/core/domain/specification/specification.ts
export interface Specification {
  toSequelizeWhere(): Record<string, any>;
}
