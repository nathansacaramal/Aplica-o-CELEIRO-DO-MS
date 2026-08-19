import { Op, WhereOptions } from "sequelize";
import { QuerySpecification } from "./query-specification";

export abstract class AbstractQuerySpecification implements QuerySpecification {
  abstract toWhere(): WhereOptions;

  and(other: QuerySpecification): QuerySpecification {
    return new AndSpecification(this, other);
  }

  or(other: QuerySpecification): QuerySpecification {
    return new OrSpecification(this, other);
  }

  not(): QuerySpecification {
    return new NotSpecification(this);
  }
}

class AndSpecification extends AbstractQuerySpecification {
  constructor(
    private readonly left: QuerySpecification,
    private readonly right: QuerySpecification,
  ) {
    super();
  }

  toWhere(): WhereOptions {
    return { [Op.and]: [this.left.toWhere(), this.right.toWhere()] };
  }
}

class OrSpecification extends AbstractQuerySpecification {
  constructor(
    private readonly left: QuerySpecification,
    private readonly right: QuerySpecification,
  ) {
    super();
  }

  toWhere(): WhereOptions {
    return { [Op.or]: [this.left.toWhere(), this.right.toWhere()] };
  }
}

class NotSpecification extends AbstractQuerySpecification {
  constructor(private readonly spec: QuerySpecification) {
    super();
  }

  toWhere(): WhereOptions {
    return { [Op.not]: this.spec.toWhere() };
  }
}
