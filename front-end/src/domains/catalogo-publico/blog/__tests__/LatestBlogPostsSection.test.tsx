import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LatestBlogPostsSection } from "../components/LatestBlogPostsSection";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    listLatestPublishedBlogPosts: vi.fn(),
  },
}));

import { publicApiClient } from "@/services/public-api/client";

function makePost(id: number, titulo: string) {
  return {
    id,
    titulo,
    slug: `slug-${id}`,
    resumo: `Resumo ${id}`,
    conteudo: `<p>Conteúdo ${id}</p>`,
    imagemDestaque: "/images/post.jpg",
    status: "published" as const,
    dataPublicacao: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("LatestBlogPostsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os cards das publicações retornadas", async () => {
    vi.mocked(publicApiClient.listLatestPublishedBlogPosts).mockResolvedValue([
      makePost(1, "Primeira publicação"),
      makePost(2, "Segunda publicação"),
    ]);

    render(
      <MemoryRouter>
        <LatestBlogPostsSection />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Primeira publicação")).toBeInTheDocument();
    expect(screen.getByText("Segunda publicação")).toBeInTheDocument();
    expect(screen.getByText("Últimas publicações")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Leia mais" })).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Ver todas as publicações" }),
    ).toHaveAttribute("href", "/blog");
  });

  it("não renderiza nada quando não há publicações publicadas", async () => {
    vi.mocked(publicApiClient.listLatestPublishedBlogPosts).mockResolvedValue([]);

    const { container } = render(
      <MemoryRouter>
        <LatestBlogPostsSection />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
