import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSiteLogo } from "../useSiteLogo";

const { getSiteLogoMock } = vi.hoisted(() => ({
  getSiteLogoMock: vi.fn(),
}));

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getSiteLogo: (...args: unknown[]) => getSiteLogoMock(...args),
  },
}));

describe("useSiteLogo", () => {
  it("começa com a logo padrão e troca para a url configurada", async () => {
    getSiteLogoMock.mockResolvedValue({ url: "https://cdn.example/logo.png" });

    const { result } = renderHook(() => useSiteLogo());

    expect(result.current.url).toBe("/celeiro_ms_logo.jpg");

    await waitFor(() =>
      expect(result.current.url).toBe("https://cdn.example/logo.png"),
    );
  });

  it("nunca lança e mantém a logo padrão quando a API falha", async () => {
    getSiteLogoMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useSiteLogo());

    await waitFor(() => expect(getSiteLogoMock).toHaveBeenCalled());
    expect(result.current.url).toBe("/celeiro_ms_logo.jpg");
  });
});
