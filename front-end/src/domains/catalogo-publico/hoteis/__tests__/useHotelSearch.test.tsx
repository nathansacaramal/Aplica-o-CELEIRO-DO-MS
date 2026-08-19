import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ICity } from "@/entities/city/city.types";

const searchHotelsByCityMock = vi.fn();

vi.mock("@/services/hotels/hotelSearch.api", () => ({
  searchHotelsByCity: (...args: unknown[]) => searchHotelsByCityMock(...args),
}));

import { useHotelSearch } from "../hooks/useHotelSearch";

const city: ICity = {
  id: 1,
  name: "Dourados",
  slug: "dourados",
  state: "MS",
  summary: "",
  published: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("useHotelSearch", () => {
  it("começa sem busca realizada", () => {
    const { result } = renderHook(() => useHotelSearch());

    expect(result.current.hasSearched).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("busca com sucesso e popula o resultado", async () => {
    searchHotelsByCityMock.mockResolvedValueOnce({
      center: { lat: 1, lon: 2 },
      hotels: [],
    });

    const { result } = renderHook(() => useHotelSearch());

    act(() => {
      result.current.search(city);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasSearched).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.result).toEqual({
      center: { lat: 1, lon: 2 },
      hotels: [],
    });
    expect(result.current.error).toBe("");
    expect(searchHotelsByCityMock).toHaveBeenCalledWith(
      "Dourados",
      "MS",
      expect.any(AbortSignal),
    );
  });

  it("captura erro da busca e expõe a mensagem", async () => {
    searchHotelsByCityMock.mockRejectedValueOnce(
      new Error("Não foi possível buscar os hotéis. Tente novamente."),
    );

    const { result } = renderHook(() => useHotelSearch());

    act(() => {
      result.current.search(city);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(
      "Não foi possível buscar os hotéis. Tente novamente.",
    );
    expect(result.current.result).toBeNull();
  });
});
