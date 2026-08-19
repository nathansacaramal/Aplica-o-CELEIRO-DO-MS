import { WhereOptions } from "sequelize";

export interface QuerySpecification {
  toWhere(): WhereOptions;
  and(other: QuerySpecification): QuerySpecification;
  or(other: QuerySpecification): QuerySpecification;
  not(): QuerySpecification;
}
