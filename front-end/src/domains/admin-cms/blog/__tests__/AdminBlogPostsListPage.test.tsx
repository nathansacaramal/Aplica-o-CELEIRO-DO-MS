import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminBlogPostsListPage } from "../pages/AdminBlogPostsListPage";

vi.mock("@/services/admin-api/adminBlogPosts.api", () => ({
  listAdminBlogPosts: vi.fn(),
  deleteAdminBlogPost: vi.fn(),
  updateAdminBlogPost: vi.fn(),
}));

import {
  deleteAdminBlogPost,
  listAdminBlogPosts,
  updateAdminBlogPost,
} from "@/services/admin-api/adminBlogPosts.api";

function makePost(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    titulo: "Post A",
    slug: "post-a",
    resumo: "Resumo",
    conteudo: "<p>C</p>",
    imagemDestaque: "/img.jpg",
    status: "draft" as const,
    dataPublicacao: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminBlogPostsListPage />
    </MemoryRouter>,
  );
}

describe("AdminBlogPostsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista as publicações retornadas", async () => {
    vi.mocked(listAdminBlogPosts).mockResolvedValue([makePost()]);

    renderPage();

    expect(await screen.findByText("Post A")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Rascunho" })).toBeInTheDocument();
  });

  it("mostra 'Nenhuma publicação encontrada' quando a lista vem vazia", async () => {
    vi.mocked(listAdminBlogPosts).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText("Nenhuma publicação encontrada.")).toBeInTheDocument();
  });

  it("exclui uma publicação ao clicar em Excluir", async () => {
    vi.mocked(listAdminBlogPosts).mockResolvedValue([makePost()]);
    vi.mocked(deleteAdminBlogPost).mockResolvedValue(undefined);

    renderPage();

    await screen.findByText("Post A");
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => {
      expect(deleteAdminBlogPost).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(screen.queryByText("Post A")).not.toBeInTheDocument();
    });
  });

  it("publica uma publicação ao clicar no toggle e atualiza a listagem local", async () => {
    vi.mocked(listAdminBlogPosts).mockResolvedValue([makePost({ status: "draft" })]);
    vi.mocked(updateAdminBlogPost).mockResolvedValue(makePost({ status: "published" }));

    renderPage();

    await screen.findByText("Post A");
    fireEvent.click(screen.getByRole("switch", { name: "Publicar" }));

    await waitFor(() => {
      expect(updateAdminBlogPost).toHaveBeenCalledWith({ id: 1, status: "published" });
    });
    expect(await screen.findByRole("cell", { name: "Publicado" })).toBeInTheDocument();
  });

  it("só mostra o botão Visualizar para publicações publicadas", async () => {
    vi.mocked(listAdminBlogPosts).mockResolvedValue([
      makePost({ id: 1, titulo: "Rascunho X", status: "draft" }),
      makePost({ id: 2, titulo: "Publicado Y", status: "published" }),
    ]);

    renderPage();

    await screen.findByText("Rascunho X");
    expect(screen.getAllByRole("link", { name: "Visualizar" })).toHaveLength(1);
  });
});
