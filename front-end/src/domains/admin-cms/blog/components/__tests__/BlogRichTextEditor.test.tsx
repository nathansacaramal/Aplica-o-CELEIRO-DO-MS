import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlogRichTextEditor } from "../BlogRichTextEditor";

describe("BlogRichTextEditor", () => {
  it("renderiza sem lançar, com o conteúdo inicial e a toolbar", () => {
    expect(() =>
      render(<BlogRichTextEditor value="<p>Olá</p>" onChange={vi.fn()} />),
    ).not.toThrow();

    expect(screen.getByText("Olá")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Itálico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lista não ordenada" })).toBeInTheDocument();
  });

  it("clicar nos botões de formatação não lança erro", () => {
    render(<BlogRichTextEditor value="<p>Texto</p>" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Negrito" }));
    fireEvent.click(screen.getByRole("button", { name: "Título" }));
    fireEvent.click(screen.getByRole("button", { name: "Lista não ordenada" }));
    fireEvent.click(screen.getByRole("button", { name: "Centralizar" }));

    expect(screen.getByText("Texto")).toBeInTheDocument();
  });

  it("desabilita a toolbar quando `disabled`", () => {
    render(<BlogRichTextEditor value="<p>X</p>" onChange={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: "Negrito" })).toBeDisabled();
  });
});
