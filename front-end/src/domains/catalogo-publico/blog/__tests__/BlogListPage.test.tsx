import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlogListPage } from "../pages/BlogListPage";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    listPublishedBlogPosts: vi.fn(),
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
    galeria: [],
    status: "published" as const,
    dataPublicacao: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <BlogListPage />
    </MemoryRouter>,
  );
}

describe("BlogListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza as publicações da primeira página", async () => {
    vi.mocked(publicApiClient.listPublishedBlogPosts).mockResolvedValue({
      items: [makePost(1, "Primeira publicação"), makePost(2, "Segunda publicação")],
      total: 2,
      page: 1,
      limit: 12,
    });

    renderPage();

    expect(await screen.findByText("Primeira publicação")).toBeInTheDocument();
    expect(screen.getByText("Segunda publicação")).toBeInTheDocument();
    expect(publicApiClient.listPublishedBlogPosts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 12 }),
    );
  });

  it("mostra 'Carregar mais' quando há mais páginas e carrega a próxima ao clicar", async () => {
    vi.mocked(publicApiClient.listPublishedBlogPosts)
      .mockResolvedValueOnce({
        items: [makePost(1, "Post 1")],
        total: 2,
        page: 1,
        limit: 1,
      })
      .mockResolvedValueOnce({
        items: [makePost(2, "Post 2")],
        total: 2,
        page: 2,
        limit: 1,
      });

    renderPage();

    await screen.findByText("Post 1");
    const button = screen.getByRole("button", { name: "Carregar mais" });
    fireEvent.click(button);

    expect(await screen.findByText("Post 2")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
    });
  });

  it("mostra estado vazio quando não há publicações", async () => {
    vi.mocked(publicApiClient.listPublishedBlogPosts).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
    });

    renderPage();

    expect(await screen.findByText("Nenhuma publicação encontrada")).toBeInTheDocument();
  });

  it("mostra estado de erro quando a API falha", async () => {
    vi.mocked(publicApiClient.listPublishedBlogPosts).mockRejectedValue(
      new Error("falha de rede"),
    );

    renderPage();

    expect(await screen.findByText("Erro ao carregar publicações")).toBeInTheDocument();
    expect(screen.getByText("falha de rede")).toBeInTheDocument();
  });
});
