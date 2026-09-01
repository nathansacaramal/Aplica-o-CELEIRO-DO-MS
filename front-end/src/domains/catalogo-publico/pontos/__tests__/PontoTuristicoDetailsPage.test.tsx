import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PontoTuristicoDetailsPage } from "../pages/PontoTuristicoDetailsPage";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getPublishedTouristPointBySlug: vi.fn(),
  },
}));

import { publicApiClient } from "@/services/public-api/client";

function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/pontos-turisticos/:slug"
          element={<PontoTuristicoDetailsPage />}
        />
        <Route path="/pontos-turisticos" element={<div>Pontos fallback</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PontoTuristicoDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar loading inicial", () => {
    vi.mocked(
      publicApiClient.getPublishedTouristPointBySlug,
    ).mockImplementation(() => new Promise(() => undefined));

    renderWithRoute("/pontos-turisticos/parque-antenor-martins");

    expect(
      screen.getByRole("status", {
        name: /carregando dados do ponto turístico/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar os dados do ponto turístico quando encontrado", async () => {
    vi.mocked(publicApiClient.getPublishedTouristPointBySlug).mockResolvedValue(
      {
        id: 1,
        cityId: 1,
        citySlug: "dourados",
        slug: "parque-antenor-martins",
        name: "Parque Antenor Martins",
        description:
          "Área verde com lago, pista de caminhada e espaço de lazer.",
        category: "parque",
        address: "Rua Antônio Emílio de Figueiredo",
        openingHours: "08:00",
        imageUrl: "/images/highlights/parque-antenor-martins.jpg",
        featured: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );

    renderWithRoute("/pontos-turisticos/parque-antenor-martins");

    expect(
      await screen.findByText("Parque Antenor Martins"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Área verde com lago, pista de caminhada e espaço de lazer.",
      ),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Parque")).toHaveLength(2);
    expect(
      screen.getAllByText("Rua Antônio Emílio de Figueiredo").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("08:00").length).toBeGreaterThan(0);
  });

  it("deve redirecionar para /pontos-turisticos quando o ponto não existir", async () => {
    vi.mocked(
      publicApiClient.getPublishedTouristPointBySlug,
    ).mockResolvedValue(null);

    renderWithRoute("/pontos-turisticos/inexistente");

    await waitFor(() => {
      expect(screen.getByText("Pontos fallback")).toBeInTheDocument();
    });
  });

  it("deve exibir estado de erro quando a API falhar", async () => {
    vi.mocked(publicApiClient.getPublishedTouristPointBySlug).mockRejectedValue(
      new Error("timeout"),
    );

    renderWithRoute("/pontos-turisticos/parque-antenor-martins");

    expect(
      await screen.findByText("Erro ao carregar o ponto turístico"),
    ).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar para pontos turísticos" }),
    ).toHaveAttribute("href", "/pontos-turisticos");
  });
});
