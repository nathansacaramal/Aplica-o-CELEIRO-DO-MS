import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboardPage } from "../AdminDashboardPage";

vi.mock("@/services/admin-api/client", () => ({
  adminApiClient: {
    listCities: vi.fn(),
    listEvents: vi.fn(),
    listTouristPoints: vi.fn(),
    listHomeHighlights: vi.fn(),
  },
}));

import { adminApiClient } from "@/services/admin-api/client";

function mockLists(events: unknown[]) {
  vi.mocked(adminApiClient.listCities).mockResolvedValue([] as never);
  vi.mocked(adminApiClient.listEvents).mockResolvedValue(events as never);
  vi.mocked(adminApiClient.listTouristPoints).mockResolvedValue([] as never);
  vi.mocked(adminApiClient.listHomeHighlights).mockResolvedValue([] as never);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminDashboardPage />
    </MemoryRouter>,
  );
}

describe("AdminDashboardPage — informativo de eventos encerrados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista os eventos encerrados com data, situação e ação de gerenciar", async () => {
    mockLists([
      {
        id: 7,
        name: "Festival de Agosto",
        endDate: "2000-08-10",
        published: true,
        cityId: 1,
        citySlug: "c",
        slug: "s",
        description: "",
        featured: false,
        createdAt: "",
        updatedAt: "",
      },
    ]);

    renderPage();

    expect(await screen.findByText("Eventos encerrados")).toBeInTheDocument();
    expect(screen.getByText("Festival de Agosto")).toBeInTheDocument();
    expect(screen.getByText("10/08/2000")).toBeInTheDocument();
    expect(screen.getByText("Publicado (visível)")).toBeInTheDocument();

    const gerenciar = screen.getByRole("link", { name: "Gerenciar" });
    expect(gerenciar).toHaveAttribute("href", "/admin/eventos/editar");
  });

  it("mostra mensagem positiva quando não há eventos encerrados", async () => {
    mockLists([
      {
        id: 1,
        name: "Evento futuro",
        endDate: "2999-01-01",
        published: true,
        cityId: 1,
        citySlug: "c",
        slug: "s",
        description: "",
        featured: false,
        createdAt: "",
        updatedAt: "",
      },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Nenhum evento encerrado/)).toBeInTheDocument();
    });
    expect(screen.queryByRole("link", { name: "Gerenciar" })).not.toBeInTheDocument();
  });
});
