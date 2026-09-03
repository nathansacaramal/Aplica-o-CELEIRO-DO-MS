import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePublicNav } from "../usePublicNav";

const { getPublicNavMock } = vi.hoisted(() => ({
  getPublicNavMock: vi.fn(),
}));

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getPublicNav: (...args: unknown[]) => getPublicNavMock(...args),
  },
}));

describe("usePublicNav", () => {
  it("começa com o menu completo e depois esconde o que está configurado", async () => {
    getPublicNavMock.mockResolvedValue({ hidden: ["hoteis"] });

    const { result } = renderHook(() => usePublicNav());

    expect(result.current.items.map((item) => item.id)).toContain("hoteis");

    await waitFor(() =>
      expect(result.current.items.map((item) => item.id)).not.toContain("hoteis"),
    );
    expect(result.current.items.map((item) => item.id)).toContain("eventos");
  });

  it("nunca lança e mantém o menu completo quando a API falha", async () => {
    getPublicNavMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => usePublicNav());

    await waitFor(() => expect(getPublicNavMock).toHaveBeenCalled());
    expect(result.current.items).toHaveLength(6);
  });
});
