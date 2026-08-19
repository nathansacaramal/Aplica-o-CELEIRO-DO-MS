import type { IHotelSearchResult } from "@/entities/hotel/hotel.types";
import { toApiError } from "@/services/api/apiError";
import axios, { isAxiosError } from "axios";

/**
 * Busca de hotéis por cidade: chama o BFF (`/public/hotels`), que por sua vez
 * consulta os serviços públicos do OpenStreetMap (Nominatim + Overpass) no
 * servidor — sem exigir chave de API.
 *
 * Antes essa chamada ia direto do navegador para o Overpass, mas em produção
 * o Overpass passou a bloquear (406) requisições vindas de alguns navegadores
 * reais, provavelmente por um filtro de fingerprint/anti-bot da própria API
 * pública. Rodando no servidor evitamos essa variável por completo.
 */

/** Geocodifica a cidade e busca hotéis ao redor do seu centro via o BFF. */
export async function searchHotelsByCity(
  baseUrl: string,
  cityName: string,
  state: string,
  signal?: AbortSignal,
): Promise<IHotelSearchResult> {
  if (!baseUrl) {
    throw new Error(
      "Busca de hotéis indisponível: nenhum servidor configurado.",
    );
  }

  try {
    const { data } = await axios.get<{ data: IHotelSearchResult }>(
      `${baseUrl}/public/hotels`,
      {
        params: { city: cityName, state },
        headers: { Accept: "application/json" },
        signal,
        timeout: 30_000,
      },
    );
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.code === "ERR_CANCELED") {
      throw error;
    }
    throw toApiError(
      error,
      "Não foi possível buscar os hotéis. Tente novamente.",
    );
  }
}
