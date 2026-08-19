import { afterEach, describe, expect, it, vi } from "vitest";
import { searchHotelsByCity } from "../hotelSearch.api";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("searchHotelsByCity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("geocodifica a cidade e mapeia hotéis retornados pelo Overpass", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse([{ lat: "-22.22", lon: "-54.80" }]),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          elements: [
            {
              type: "node",
              id: 1,
              lat: -22.221,
              lon: -54.801,
              tags: {
                name: "Hotel Central",
                "addr:street": "Rua A",
                "addr:housenumber": "100",
                phone: "6730000000",
                stars: "4",
              },
            },
            {
              type: "way",
              id: 2,
              center: { lat: -22.223, lon: -54.803 },
              tags: { name: "Pousada B" },
            },
            {
              // sem coordenadas resolvíveis: deve ser descartado
              type: "relation",
              id: 3,
              tags: { name: "Sem localização" },
            },
          ],
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await searchHotelsByCity("Dourados", "MS");

    expect(result.center).toEqual({ lat: -22.22, lon: -54.8 });
    expect(result.hotels).toHaveLength(2);

    expect(result.hotels[0]).toMatchObject({
      id: "node/1",
      name: "Hotel Central",
      address: "Rua A, 100",
      phone: "6730000000",
      rating: 4,
      coordinates: { lat: -22.221, lon: -54.801 },
    });

    expect(result.hotels[1]).toMatchObject({
      id: "way/2",
      name: "Pousada B",
      coordinates: { lat: -22.223, lon: -54.803 },
    });
    expect(result.hotels[1]?.address).toBeUndefined();
    expect(result.hotels[1]?.rating).toBeUndefined();
  });

  it("lança erro amigável quando a cidade não é encontrada no geocoder", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse([])),
    );

    await expect(searchHotelsByCity("Cidade Inexistente", "MS")).rejects.toThrow(
      /não foi possível encontrar/i,
    );
  });

  it("lança erro amigável quando o geocoder falha (rede)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new TypeError("network error")),
    );

    await expect(searchHotelsByCity("Dourados", "MS")).rejects.toThrow(
      /não foi possível localizar/i,
    );
  });

  it("lança erro amigável quando a busca de hotéis falha", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ lat: "-22.22", lon: "-54.80" }]))
      .mockResolvedValueOnce(jsonResponse({}, false, 500));

    vi.stubGlobal("fetch", fetchMock);

    await expect(searchHotelsByCity("Dourados", "MS")).rejects.toThrow(
      /não foi possível buscar os hotéis/i,
    );
  });
});
