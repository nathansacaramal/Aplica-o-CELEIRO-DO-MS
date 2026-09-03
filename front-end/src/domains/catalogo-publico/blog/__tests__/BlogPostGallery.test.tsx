import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogPostGallery } from "../components/BlogPostGallery";

const fotos = ["/f1.jpg", "/f2.jpg", "/f3.jpg"];

describe("BlogPostGallery", () => {
  it("não renderiza nada quando não há fotos", () => {
    const { container } = render(<BlogPostGallery fotos={[]} tituloPublicacao="Post" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza a grade com a contagem de fotos", () => {
    render(<BlogPostGallery fotos={fotos} tituloPublicacao="Post" />);

    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Abrir foto/ })).toHaveLength(3);
  });

  it("abre o lightbox ao clicar numa miniatura e mostra a posição", () => {
    render(<BlogPostGallery fotos={fotos} tituloPublicacao="Post" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir foto 2 de 3" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });

  it("navega entre as fotos e dá a volta no fim da lista", () => {
    render(<BlogPostGallery fotos={fotos} tituloPublicacao="Post" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir foto 3 de 3" }));
    expect(screen.getByText("3/3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Próxima foto" }));
    expect(screen.getByText("1/3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Foto anterior" }));
    expect(screen.getByText("3/3")).toBeInTheDocument();
  });

  it("fecha o lightbox pelo botão e pela tecla Escape", () => {
    render(<BlogPostGallery fotos={fotos} tituloPublicacao="Post" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir foto 1 de 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar galeria" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir foto 1 de 3" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navega pelo teclado com as setas", () => {
    render(<BlogPostGallery fotos={fotos} tituloPublicacao="Post" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir foto 1 de 3" }));
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("2/3")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("esconde as setas quando há apenas uma foto", () => {
    render(<BlogPostGallery fotos={["/unica.jpg"]} tituloPublicacao="Post" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir foto 1 de 1" }));

    expect(screen.queryByRole("button", { name: "Próxima foto" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Foto anterior" })).not.toBeInTheDocument();
  });
});
