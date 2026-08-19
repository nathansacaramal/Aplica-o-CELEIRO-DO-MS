import { QuerySpecification } from "../specifications/query-specification";

export interface ListTouristPointsSpecificationRepository {
  listSpec(params: {
    spec?: QuerySpecification | null;
    limit: number;
    offset: number;
    order: [string, "ASC" | "DESC"][]; // Sequelize order
  }): Promise<{ rows: any[]; count: number }>;
}
