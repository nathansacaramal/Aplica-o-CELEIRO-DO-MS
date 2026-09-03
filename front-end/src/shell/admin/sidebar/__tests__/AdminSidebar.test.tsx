import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AdminSidebar } from "../AdminSidebar";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AdminSidebar />
    </MemoryRouter>,
  );
}

// O NavLink ativo do react-router marca o link com aria-current="page".
function isActive(name: string): boolean {
  return screen.getByRole("link", { name }).getAttribute("aria-current") === "page";
}

describe("AdminSidebar — seção Blog", () => {
  it("em /admin/blog marca só Publicações", () => {
    renderAt("/admin/blog");
    expect(isActive("Publicações")).toBe(true);
    expect(isActive("Nova publicação")).toBe(false);
  });

  it("em /admin/blog/novo marca só Nova publicação (não ambos)", () => {
    renderAt("/admin/blog/novo");
    expect(isActive("Nova publicação")).toBe(true);
    expect(isActive("Publicações")).toBe(false);
  });

  it("em /admin/blog/editar marca Publicações (editar vem da listagem)", () => {
    renderAt("/admin/blog/editar");
    expect(isActive("Publicações")).toBe(true);
    expect(isActive("Nova publicação")).toBe(false);
  });

  it("renderiza o rótulo da seção Blog", () => {
    renderAt("/admin");
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });
});
