// src/core/domain/specification/composite.specification.ts
import { Specification } from "./specification";
import { Op } from "sequelize";

export abstract class CompositeSpecification implements Specification {
  protected readonly children: Specification[];

  constructor(children: Specification[]) {
    this.children = children;
  }

  abstract toSequelizeWhere(): Record<string, any>;
}

export class AndSpecification extends CompositeSpecification {
  toSequelizeWhere() {
    return { [Op.and]: this.children.map((c) => c.toSequelizeWhere()) };
  }
}

export class OrSpecification extends CompositeSpecification {
  toSequelizeWhere() {
    return { [Op.or]: this.children.map((c) => c.toSequelizeWhere()) };
  }
}

export class NotSpecification implements Specification {
  constructor(private readonly child: Specification) {}

  toSequelizeWhere() {
    return { [Op.not]: this.child.toSequelizeWhere() };
  }
}
