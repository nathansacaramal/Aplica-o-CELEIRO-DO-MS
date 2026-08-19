import sequelize from "@/core/database";
import { Op, WhereOptions } from "sequelize";
import { AbstractQuerySpecification } from "./abstract-query-specification";

class FieldSpecification extends AbstractQuerySpecification {
  constructor(private readonly where: WhereOptions) {
    super();
  }

  toWhere(): WhereOptions {
    return this.where;
  }
}

export const touristPointCityIdInState = (state: string) => {
  const safe = sequelize.escape(state.trim());
  return new FieldSpecification({
    cityId: {
      [Op.in]: sequelize.literal(`(SELECT id FROM \`cities\` WHERE state = ${safe})`),
    },
  });
};

export const eq = (field: string, value: any) => new FieldSpecification({ [field]: value });

export const like = (field: string, value: string) =>
  new FieldSpecification({ [field]: { [Op.like]: `%${value}%` } });

export const between = (field: string, from: number, to: number) =>
  new FieldSpecification({ [field]: { [Op.between]: [from, to] } });

export const inList = (field: string, values: any[]) =>
  new FieldSpecification({ [field]: { [Op.in]: values } });
