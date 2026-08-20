import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { MaintenanceModeGate } from "../MaintenanceModeGate";

const { useMaintenanceModeMock } = vi.hoisted(() => ({
  useMaintenanceModeMock: vi.fn(),
}));

vi.mock("@/domains/public-portal/settings/hooks/useMaintenanceMode", () => ({
  useMaintenanceMode: () => useMaintenanceModeMock(),
}));

function renderGate(): void {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<MaintenanceModeGate />}>
          <Route index element={<div>Conteúdo da página</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("MaintenanceModeGate", () => {
  it("renderiza o site normalmente quando a manutenção está desativada", () => {
    useMaintenanceModeMock.mockReturnValue({ enabled: false });

    renderGate();

    expect(screen.getByText("Conteúdo da página")).toBeInTheDocument();
    expect(screen.queryByText("Site em manutenção")).not.toBeInTheDocument();
  });

  it("renderiza a página de manutenção quando ativada, sem o conteúdo da rota", () => {
    useMaintenanceModeMock.mockReturnValue({ enabled: true });

    renderGate();

    expect(screen.getByText("Site em manutenção")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo da página")).not.toBeInTheDocument();
  });
});
