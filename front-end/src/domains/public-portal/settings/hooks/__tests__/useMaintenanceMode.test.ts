import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMaintenanceMode } from "../useMaintenanceMode";

const { getMaintenanceModeMock } = vi.hoisted(() => ({
  getMaintenanceModeMock: vi.fn(),
}));

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getMaintenanceMode: (...args: unknown[]) => getMaintenanceModeMock(...args),
  },
}));

describe("useMaintenanceMode", () => {
  it("começa com enabled: false e atualiza para true quando a API confirma manutenção", async () => {
    getMaintenanceModeMock.mockResolvedValue({ enabled: true });

    const { result } = renderHook(() => useMaintenanceMode());

    expect(result.current.enabled).toBe(false);

    await waitFor(() => expect(result.current.enabled).toBe(true));
  });

  it("permanece enabled: false quando a API responde desativado", async () => {
    getMaintenanceModeMock.mockResolvedValue({ enabled: false });

    const { result } = renderHook(() => useMaintenanceMode());

    await waitFor(() => expect(getMaintenanceModeMock).toHaveBeenCalled());
    expect(result.current.enabled).toBe(false);
  });

  it("nunca lança e mantém enabled: false quando a API falha", async () => {
    getMaintenanceModeMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useMaintenanceMode());

    await waitFor(() => expect(getMaintenanceModeMock).toHaveBeenCalled());
    expect(result.current.enabled).toBe(false);
  });
});
