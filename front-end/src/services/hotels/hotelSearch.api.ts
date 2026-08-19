import type {
  IHotel,
  IHotelCoordinates,
  IHotelSearchResult,
} from "@/entities/hotel/hotel.types";

/**
 * Busca de hotéis por cidade via serviços públicos do OpenStreetMap — não exige
 * chave de API: Nominatim geocodifica a cidade e Overpass busca POIs `tourism=hotel`
 * ao redor do centro encontrado. Ver `docs/hotels-search.md`.
 */

const DEFAULT_NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const DEFAULT_OVERPASS_BASE_URL = "https://overpass-api.de/api/interpreter";

/** Raio de busca de hotéis ao redor do centro da cidade, em metros. */
const SEARCH_RADIUS_METERS = 8_000;
/** Limite de resultados: mantém o mapa e a lista legíveis. */
const MAX_RESULTS = 60;

function getNominatimBaseUrl(): string {
  const raw: string | undefined = import.meta.env.VITE_NOMINATIM_BASE_URL;
  return (typeof raw === "string" && raw.trim() !== ""
    ? raw.trim()
    : DEFAULT_NOMINATIM_BASE_URL
  ).replace(/\/+$/, "");
}

function getOverpassBaseUrl(): string {
  const raw: string | undefined = import.meta.env.VITE_OVERPASS_BASE_URL;
  return (typeof raw === "string" && raw.trim() !== ""
    ? raw.trim()
    : DEFAULT_OVERPASS_BASE_URL
  ).replace(/\/+$/, "");
}

interface INominatimResult {
  lat: string;
  lon: string;
}

async function geocodeCity(
  cityName: string,
  state: string,
  signal?: AbortSignal,
): Promise<IHotelCoordinates> {
  const query = `${cityName}, ${state}, Brasil`;
  const url = new URL(getNominatimBaseUrl() + "/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("q", query);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new Error(
      "Não foi possível localizar a cidade no mapa. Verifique sua conexão e tente novamente.",
    );
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível localizar a cidade no mapa. Tente novamente.",
    );
  }

  const results = (await response.json()) as INominatimResult[];
  const first = results[0];
  if (!first) {
    throw new Error(
      "Não foi possível encontrar a localização desta cidade no mapa.",
    );
  }

  return { lat: Number(first.lat), lon: Number(first.lon) };
}

interface IOverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface IOverpassResponse {
  elements: IOverpassElement[];
}

function buildOverpassQuery(center: IHotelCoordinates): string {
  const around = `around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon}`;
  return `[out:json][timeout:25];(node["tourism"="hotel"](${around});way["tourism"="hotel"](${around});relation["tourism"="hotel"](${around}););out center ${MAX_RESULTS};`;
}

function buildAddress(tags: Record<string, string>): string | undefined {
  const parts = [
    tags["addr:street"]
      ? `${tags["addr:street"]}${tags["addr:housenumber"] ? `, ${tags["addr:housenumber"]}` : ""}`
      : undefined,
    tags["addr:suburb"],
    tags["addr:city"],
  ].filter((part): part is string => Boolean(part && part.trim() !== ""));

  return parts.length > 0 ? parts.join(" - ") : undefined;
}

function mapElementToHotel(element: IOverpassElement): IHotel | null {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (lat === undefined || lon === undefined) {
    return null;
  }

  const tags = element.tags ?? {};
  const stars = Number(tags.stars);

  return {
    id: `${element.type}/${element.id}`,
    name: tags.name?.trim() || "Hotel sem nome informado",
    address: buildAddress(tags),
    phone: tags.phone ?? tags["contact:phone"],
    rating: Number.isFinite(stars) && stars > 0 ? stars : undefined,
    coordinates: { lat, lon },
  };
}

async function searchHotelsNear(
  center: IHotelCoordinates,
  signal?: AbortSignal,
): Promise<IHotel[]> {
  let response: Response;
  try {
    response = await fetch(getOverpassBaseUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: `data=${encodeURIComponent(buildOverpassQuery(center))}`,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new Error(
      "Não foi possível buscar os hotéis. Verifique sua conexão e tente novamente.",
    );
  }

  if (!response.ok) {
    throw new Error("Não foi possível buscar os hotéis. Tente novamente.");
  }

  const data = (await response.json()) as IOverpassResponse;
  return data.elements
    .map(mapElementToHotel)
    .filter((hotel): hotel is IHotel => hotel !== null);
}

/** Geocodifica a cidade e busca hotéis ao redor do seu centro. */
export async function searchHotelsByCity(
  cityName: string,
  state: string,
  signal?: AbortSignal,
): Promise<IHotelSearchResult> {
  const center = await geocodeCity(cityName, state, signal);
  const hotels = await searchHotelsNear(center, signal);
  return { center, hotels };
}
