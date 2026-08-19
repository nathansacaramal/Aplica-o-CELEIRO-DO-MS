// src/core/domain/specification/leaves.ts
import { Specification } from "./specification";
import { Op } from "sequelize";

export class EqSpecification implements Specification {
  constructor(
    private readonly field: string,
    private readonly value: any,
  ) {}
  toSequelizeWhere() {
    return { [this.field]: this.value };
  }
}

export class LikeSpecification implements Specification {
  constructor(
    private readonly field: string,
    private readonly value: string,
  ) {}
  toSequelizeWhere() {
    return { [this.field]: { [Op.like]: `%${this.value}%` } };
  }
}

export class InSpecification implements Specification {
  constructor(
    private readonly field: string,
    private readonly values: any[],
  ) {}
  toSequelizeWhere() {
    return { [this.field]: { [Op.in]: this.values } };
  }
}

export class BetweenSpecification implements Specification {
  constructor(
    private readonly field: string,
    private readonly from: number | Date,
    private readonly to: number | Date,
  ) {}
  toSequelizeWhere() {
    return { [this.field]: { [Op.between]: [this.from, this.to] } };
  }
}
