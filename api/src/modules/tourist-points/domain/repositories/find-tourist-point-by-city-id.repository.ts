import { TouristPointEntity } from "../entities/tourist-point.entity";

export interface FindTouristPointByCityRepository {
  findByCityId(cityId: number): Promise<TouristPointEntity[] | null>;
}
