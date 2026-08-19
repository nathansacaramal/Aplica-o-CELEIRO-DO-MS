import { TouristPointEntity } from "../entities/tourist-point.entity";

export interface ListTouristPointRepository {
  list(): Promise<TouristPointEntity[]>;
}
