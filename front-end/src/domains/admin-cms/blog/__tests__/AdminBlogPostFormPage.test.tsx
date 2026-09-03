import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminBlogPostFormPage } from "../pages/AdminBlogPostFormPage";

vi.mock("@/services/admin-api/adminBlogPosts.api", () => ({
  getAdminBlogPostById: vi.fn(),
  createAdminBlogPost: vi.fn(),
  updateAdminBlogPost: vi.fn(),
}));

vi.mock("@/domains/admin-cms/blog/components/BlogRichTextEditor", () => ({
  BlogRichTextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (html: string) => void;
  }) => (
    <textarea
      aria-label="Conteúdo"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

import {
  createAdminBlogPost,
  getAdminBlogPostById,
  updateAdminBlogPost,
} from "@/services/admin-api/adminBlogPosts.api";

function renderAt(path: string, state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/admin/blog/novo" element={<AdminBlogPostFormPage />} />
        <Route path="/admin/blog/editar" element={<AdminBlogPostFormPage />} />
        <Route path="/admin/blog" element={<div>Listagem fallback</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminBlogPostFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria uma nova publicação e navega para a listagem", async () => {
    vi.mocked(createAdminBlogPost).mockResolvedValue({
      id: 1,
      titulo: "Novo post",
      slug: "novo-post",
      resumo: "R",
      conteudo: "<p>Conteúdo</p>",
      galeria: [],
      status: "draft",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    renderAt("/admin/blog/novo");

    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Novo post" },
    });
    fireEvent.change(screen.getByLabelText("Conteúdo"), {
      target: { value: "<p>Conteúdo</p>" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar publicação" }));

    await waitFor(() => {
      expect(createAdminBlogPost).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: "Novo post", conteudo: "<p>Conteúdo</p>", status: "draft" }),
      );
    });
    expect(await screen.findByText("Listagem fallback")).toBeInTheDocument();
  });

  it("exige título antes de salvar", async () => {
    renderAt("/admin/blog/novo");

    fireEvent.click(screen.getByRole("button", { name: "Salvar publicação" }));

    expect(await screen.findByText("Informe o título da publicação.")).toBeInTheDocument();
    expect(createAdminBlogPost).not.toHaveBeenCalled();
  });

  it("redireciona para a listagem ao acessar /editar sem id no state", () => {
    renderAt("/admin/blog/editar");

    expect(screen.getByText("Listagem fallback")).toBeInTheDocument();
  });

  it("carrega a publicação existente e permite editar o status", async () => {
    vi.mocked(getAdminBlogPostById).mockResolvedValue({
      id: 5,
      titulo: "Post existente",
      slug: "post-existente",
      resumo: "R",
      conteudo: "<p>Original</p>",
      galeria: [],
      imagemDestaque: "/img.jpg",
      status: "draft",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    vi.mocked(updateAdminBlogPost).mockResolvedValue({
      id: 5,
      titulo: "Post existente",
      slug: "post-existente",
      resumo: "R",
      conteudo: "<p>Original</p>",
      galeria: [],
      status: "published",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    renderAt("/admin/blog/editar", { id: 5 });

    expect(await screen.findByDisplayValue("Post existente")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "published" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar publicação" }));

    await waitFor(() => {
      expect(updateAdminBlogPost).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, status: "published" }),
      );
    });
    expect(await screen.findByText("Publicação atualizada com sucesso.")).toBeInTheDocument();
  });
});
