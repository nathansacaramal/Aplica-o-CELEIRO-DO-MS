export interface IHotelCoordinates {
  lat: number;
  lon: number;
}

export interface IHotel {
  /** Id estável derivado da fonte (OSM `type/id`), usado como key de lista e correlação com o marcador do mapa. */
  id: string;
  name: string;
  address?: string;
  rating?: number;
  phone?: string;
  coordinates: IHotelCoordinates;
}

export interface IHotelSearchResult {
  /** Centro geográfico da cidade buscada, usado para centralizar o mapa. */
  center: IHotelCoordinates;
  hotels: IHotel[];
}
