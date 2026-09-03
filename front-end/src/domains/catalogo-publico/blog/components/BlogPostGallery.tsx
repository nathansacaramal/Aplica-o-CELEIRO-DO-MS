import { useCallback, useEffect, useState, type ReactElement } from "react";

interface IBlogPostGalleryProps {
  fotos: string[];
  /** Usado no alt das fotos, para leitores de tela terem contexto da publicação. */
  tituloPublicacao: string;
}

/**
 * Grade de miniaturas que abre a foto em tela cheia (lightbox) ao clicar.
 *
 * Grade primeiro porque cobertura de evento tem muitas fotos e o leitor quer
 * varrer o conjunto; o lightbox entra só quando ele escolhe uma para ver de
 * perto. Sem autoplay: aqui a navegação é do leitor, diferente do banner da home.
 */
export function BlogPostGallery({
  fotos,
  tituloPublicacao,
}: IBlogPostGalleryProps): ReactElement | null {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const goTo = useCallback(
    (offset: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + offset + fotos.length) % fotos.length;
      });
    },
    [fotos.length],
  );

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "ArrowLeft") goTo(-1);
    }

    window.addEventListener("keydown", handleKeyDown);
    // Trava o scroll do fundo enquanto o lightbox está aberto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, goTo]);

  if (fotos.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900">
        Galeria de fotos{" "}
        <span className="text-base font-normal text-zinc-500">({fotos.length})</span>
      </h2>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fotos.map((foto, index) => (
          <li key={`${index}-${foto}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Abrir foto ${index + 1} de ${fotos.length}`}
              className="group block w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <img
                src={foto}
                alt={`${tituloPublicacao} — foto ${index + 1}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${openIndex + 1} de ${fotos.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar galeria"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-lg text-white transition hover:bg-white/20"
          >
            ✕
          </button>

          <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white">
            {openIndex + 1}/{fotos.length}
          </span>

          {fotos.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goTo(-1);
              }}
              aria-label="Foto anterior"
              className="absolute left-2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white transition hover:bg-white/20 sm:left-6"
            >
              ‹
            </button>
          ) : null}

          <img
            src={fotos[openIndex]}
            alt={`${tituloPublicacao} — foto ${openIndex + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />

          {fotos.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goTo(1);
              }}
              aria-label="Próxima foto"
              className="absolute right-2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white transition hover:bg-white/20 sm:right-6"
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
