export const TOURIST_POINT_SORT_FIELDS = ["name", "city", "state", "createdAt"] as const;

export type TouristPointSortField = (typeof TOURIST_POINT_SORT_FIELDS)[number];
