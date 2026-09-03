import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TopNav } from "../TopNav";

const { getPublicNavMock } = vi.hoisted(() => ({
  getPublicNavMock: vi.fn(),
}));

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getPublicNav: (...args: unknown[]) => getPublicNavMock(...args),
    getSiteLogo: vi.fn().mockResolvedValue({ url: "/celeiro_ms_logo.jpg" }),
  },
}));

beforeEach(() => {
  getPublicNavMock.mockReset();
  getPublicNavMock.mockResolvedValue({ hidden: [] });
});

describe("TopNav", () => {
  it("deve renderizar a marca do portal", () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByText("Celeiro do MS")).toBeInTheDocument();
    expect(screen.getByText("Turismo & Eventos")).toBeInTheDocument();
  });

  it("deve renderizar os links principais", () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );

    expect(screen.getByRole("link", { name: "Eventos" })).toHaveAttribute(
      "href",
      "/eventos",
    );

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );

    expect(
      screen.getByRole("link", { name: "Pontos turísticos" }),
    ).toHaveAttribute("href", "/pontos-turisticos");

    expect(screen.getByRole("link", { name: "Cidades" })).toHaveAttribute(
      "href",
      "/cidades",
    );

    expect(screen.getByRole("link", { name: "Hotéis" })).toHaveAttribute(
      "href",
      "/hoteis",
    );

    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute(
      "href",
      "/sobre",
    );
  });

  it("deve renderizar a logo com texto alternativo", () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByAltText("Logo do Celeiro do MS")).toBeInTheDocument();
  });

  it("não deve renderizar itens escondidos nas configurações", async () => {
    getPublicNavMock.mockResolvedValue({ hidden: ["hoteis", "sobre"] });

    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Hotéis" })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("link", { name: "Sobre" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Eventos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
  });

  it("deve marcar o link atual conforme a rota", () => {
    render(
      <MemoryRouter initialEntries={["/eventos"]}>
        <TopNav />
      </MemoryRouter>,
    );

    const eventosLink = screen.getByRole("link", { name: "Eventos" });

    expect(eventosLink).toHaveAttribute("aria-current", "page");
  });
});
