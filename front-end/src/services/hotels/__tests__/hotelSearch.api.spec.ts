import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockGet } = vi.hoisted(() => {
  const mockGet = vi.fn();
  return { mockGet };
});

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: { ...actual.default, get: mockGet },
  };
});

import { searchHotelsByCity } from "../hotelSearch.api";

describe("searchHotelsByCity", () => {
  afterEach(() => {
    mockGet.mockReset();
  });

  it("chama o BFF com cidade e estado e retorna centro + hotéis", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          center: { lat: -22.22, lon: -54.8 },
          hotels: [
            {
              id: "node/1",
              name: "Hotel Central",
              coordinates: { lat: -22.221, lon: -54.801 },
            },
          ],
        },
      },
    });

    const result = await searchHotelsByCity(
      "https://bff.test/api",
      "Dourados",
      "MS",
    );

    expect(mockGet).toHaveBeenCalledWith(
      "https://bff.test/api/public/hotels",
      expect.objectContaining({
        params: { city: "Dourados", state: "MS" },
      }),
    );
    expect(result.center).toEqual({ lat: -22.22, lon: -54.8 });
    expect(result.hotels).toHaveLength(1);
    expect(result.hotels[0]?.name).toBe("Hotel Central");
  });

  it("rejeita quando nenhuma URL de BFF está configurada", async () => {
    await expect(searchHotelsByCity("", "Dourados", "MS")).rejects.toThrow(
      /indisponível/i,
    );
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("lança erro amigável quando o BFF falha", async () => {
    const error = new AxiosError(
      "fail",
      "ERR_BAD_RESPONSE",
      {} as InternalAxiosRequestConfig,
      undefined,
      {
        status: 502,
        statusText: "Bad Gateway",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data: {
          error: {
            message: "Não foi possível buscar os hotéis. Tente novamente.",
          },
        },
      },
    );
    mockGet.mockRejectedValueOnce(error);

    await expect(
      searchHotelsByCity("https://bff.test/api", "Dourados", "MS"),
    ).rejects.toThrow(/não foi possível buscar os hotéis/i);
  });
});
