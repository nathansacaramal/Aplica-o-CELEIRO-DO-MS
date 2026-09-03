import { useId, useRef, useState, type ChangeEvent, type ReactElement } from "react";
import { Button } from "@/design-system/ui";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
/** Mesmo teto do backend (blog-post-schemas.ts): o upload processa cada foto com sharp. */
const MAX_IMAGES = 30;

export interface IAdminGalleryFieldProps {
  id: string;
  label?: string;
  /** Fotos já publicadas (http/https) e novas escolhidas agora (data URL), na ordem de exibição. */
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  maxBytes?: number;
  helperText?: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      typeof result === "string" ? resolve(result) : reject(new Error("Leitura inválida"));
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

/**
 * Galeria de fotos do CMS: aceita vários arquivos de uma vez, mostra as
 * miniaturas na ordem de exibição e permite remover ou reordenar.
 */
export function AdminGalleryField(props: IAdminGalleryFieldProps): ReactElement {
  const {
    id,
    label = "Galeria de fotos",
    value,
    onChange,
    disabled = false,
    maxBytes = DEFAULT_MAX_BYTES,
    helperText = "Opcional: selecione várias fotos de uma vez para montar a galeria da publicação.",
  } = props;

  const reactId = useId();
  const fileInputId = `${id}-files-${reactId}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hint, setHint] = useState<string>("");

  async function handleFilesPick(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    setHint("");
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) {
      return;
    }

    const rejected: string[] = [];
    const accepted: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} (não é imagem)`);
        continue;
      }
      if (file.size > maxBytes) {
        rejected.push(`${file.name} (maior que ${Math.round(maxBytes / (1024 * 1024))} MB)`);
        continue;
      }
      accepted.push(file);
    }

    const freeSlots = MAX_IMAGES - value.length;
    const withinLimit = accepted.slice(0, Math.max(0, freeSlots));
    if (accepted.length > withinLimit.length) {
      rejected.push(`${accepted.length - withinLimit.length} foto(s) acima do limite de ${MAX_IMAGES}`);
    }

    try {
      const dataUrls = await Promise.all(withinLimit.map(readFileAsDataUrl));
      if (dataUrls.length > 0) {
        onChange([...value, ...dataUrls]);
      }
    } catch {
      rejected.push("falha ao ler um dos arquivos");
    }

    if (rejected.length > 0) {
      setHint(`Ignorado: ${rejected.join(", ")}.`);
    }
  }

  function handleRemove(index: number): void {
    setHint("");
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleMove(index: number, offset: number): void {
    const target = index + offset;
    if (target < 0 || target >= value.length) {
      return;
    }
    const next = [...value];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved as string);
    onChange(next);
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        <p className="text-xs text-zinc-500">{helperText}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || value.length >= MAX_IMAGES}
          className="sr-only"
          onChange={(event) => void handleFilesPick(event)}
          aria-label={`${label}: escolher arquivos`}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || value.length >= MAX_IMAGES}
          onClick={() => fileInputRef.current?.click()}
        >
          Adicionar fotos…
        </Button>

        <span className="text-xs text-zinc-500">
          {value.length} de {MAX_IMAGES} fotos
        </span>

        {value.length > 0 ? (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => {
              setHint("");
              onChange([]);
            }}
          >
            Limpar galeria
          </Button>
        ) : null}
      </div>

      {hint !== "" ? (
        <p className="text-sm text-amber-700" role="alert">
          {hint}
        </p>
      ) : null}

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((item, index) => (
            <li
              key={`${index}-${item.slice(0, 32)}`}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
            >
              <img
                src={item}
                alt={`Foto ${index + 1} da galeria`}
                className="h-28 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => handleMove(index, -1)}
                    aria-label={`Mover foto ${index + 1} para trás`}
                    className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === value.length - 1}
                    onClick={() => handleMove(index, 1)}
                    aria-label={`Mover foto ${index + 1} para frente`}
                    className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    →
                  </button>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                  aria-label={`Remover foto ${index + 1}`}
                  className="rounded-md border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
