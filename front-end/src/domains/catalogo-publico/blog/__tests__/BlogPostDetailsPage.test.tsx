import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlogPostDetailsPage } from "../pages/BlogPostDetailsPage";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getPublishedBlogPostBySlug: vi.fn(),
  },
}));

import { publicApiClient } from "@/services/public-api/client";

function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/blog/:slug" element={<BlogPostDetailsPage />} />
        <Route path="/" element={<div>Home fallback</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BlogPostDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar loading inicial", () => {
    vi.mocked(publicApiClient.getPublishedBlogPostBySlug).mockImplementation(
      () => new Promise(() => undefined),
    );

    renderWithRoute("/blog/festival-de-inverno");

    expect(
      screen.getByRole("status", { name: /carregando publicação/i }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o título e o conteúdo sanitizado da publicação", async () => {
    vi.mocked(publicApiClient.getPublishedBlogPostBySlug).mockResolvedValue({
      id: 1,
      titulo: "Festival de Inverno movimenta Nova Andradina",
      slug: "festival-de-inverno-movimenta-nova-andradina",
      resumo: "Resumo do festival.",
      conteudo: "<p>Texto completo</p><script>alert(1)</script>",
      imagemDestaque: "/images/festival.jpg",
      status: "published",
      dataPublicacao: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    renderWithRoute("/blog/festival-de-inverno-movimenta-nova-andradina");

    expect(
      await screen.findByText("Festival de Inverno movimenta Nova Andradina"),
    ).toBeInTheDocument();
    expect(screen.getByText("Texto completo")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });

  it("deve redirecionar para a home quando a publicação não existir", async () => {
    vi.mocked(publicApiClient.getPublishedBlogPostBySlug).mockResolvedValue(null);

    renderWithRoute("/blog/inexistente");

    await waitFor(() => {
      expect(screen.getByText("Home fallback")).toBeInTheDocument();
    });
  });

  it("deve exibir estado de erro quando a API falhar", async () => {
    vi.mocked(publicApiClient.getPublishedBlogPostBySlug).mockRejectedValue(
      new Error("falha de rede"),
    );

    renderWithRoute("/blog/festival-de-inverno");

    expect(
      await screen.findByText("Erro ao carregar a publicação"),
    ).toBeInTheDocument();
    expect(screen.getByText("falha de rede")).toBeInTheDocument();
  });
});
