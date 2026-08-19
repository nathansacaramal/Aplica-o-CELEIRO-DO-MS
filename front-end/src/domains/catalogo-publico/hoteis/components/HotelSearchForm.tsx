import { Button } from "@/design-system/ui";
import type { ICity } from "@/entities/city/city.types";
import type { ChangeEvent, FormEvent, ReactElement } from "react";

interface IHotelSearchFormProps {
  cidades: ICity[];
  cidadeSlug: string;
  isLoadingCidades: boolean;
  errorCidades: string;
  isSubmitting: boolean;
  validationError: string;
  onCidadeChange: (slug: string) => void;
  onSubmit: () => void;
}

export function HotelSearchForm({
  cidades,
  cidadeSlug,
  isLoadingCidades,
  errorCidades,
  isSubmitting,
  validationError,
  onCidadeChange,
  onSubmit,
}: IHotelSearchFormProps): ReactElement {
  function handleCidadeChange(event: ChangeEvent<HTMLSelectElement>): void {
    onCidadeChange(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-2">
          <label
            htmlFor="hoteis-cidade"
            className="text-sm font-medium text-zinc-700"
          >
            Cidade
          </label>

          <select
            id="hoteis-cidade"
            value={cidadeSlug}
            onChange={handleCidadeChange}
            disabled={isLoadingCidades || Boolean(errorCidades)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:bg-zinc-100"
          >
            <option value="">
              {isLoadingCidades ? "Carregando cidades..." : "Selecione uma cidade"}
            </option>
            {cidades.map((cidade: ICity) => (
              <option key={cidade.id} value={cidade.slug}>
                {cidade.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isLoadingCidades || Boolean(errorCidades)}
        >
          Buscar Hotéis
        </Button>
      </form>

      {errorCidades ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          Não foi possível carregar a lista de cidades: {errorCidades}
        </p>
      ) : null}

      {!errorCidades && validationError ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {validationError}
        </p>
      ) : null}
    </section>
  );
}
