import { Section, SectionHeader } from "@/design-system/ui";
import { usePublicCities } from "@/domains/public-portal/cities/hooks/usePublicCities";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";
import { useState, type ReactElement } from "react";
import { EmptyState } from "@/domains/catalogo-publico/shared/components/EmptyState";
import { HotelList } from "../components/HotelList";
import { HotelMap } from "../components/HotelMap";
import { HotelSearchForm } from "../components/HotelSearchForm";
import { useHotelSearch } from "../hooks/useHotelSearch";

export function HoteisPage(): ReactElement {
  usePublicPageMetadata({
    title: "Hotéis | Celeiro do MS",
    description:
      "Encontre hotéis disponíveis nas cidades do Celeiro do MS, com mapa e lista de resultados.",
    canonicalPath: "/hoteis",
  });

  const {
    cities,
    isLoading: isLoadingCidades,
    error: errorCidades,
  } = usePublicCities();

  const [cidadeSlug, setCidadeSlug] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const { isLoading, error, hasSearched, result, search } = useHotelSearch();

  function handleCidadeChange(slug: string): void {
    setCidadeSlug(slug);
    if (slug) {
      setValidationError("");
    }
  }

  function handleSubmit(): void {
    const selectedCity = cities.find((city) => city.slug === cidadeSlug);
    if (!selectedCity) {
      setValidationError("Selecione uma cidade para buscar hotéis.");
      return;
    }
    setValidationError("");
    setSelectedHotelId(null);
    search(selectedCity);
  }

  const hotels = result?.hotels ?? [];
  const isEmpty: boolean =
    hasSearched && !isLoading && !error && hotels.length === 0;
  const hasResults: boolean =
    hasSearched && !isLoading && !error && hotels.length > 0;

  return (
    <Section spacing="xl">
      <SectionHeader description="Selecione uma cidade para encontrar hotéis disponíveis na região do Celeiro do MS.">
        Hotéis
      </SectionHeader>

      <div className="mt-8">
        <HotelSearchForm
          cidades={cities}
          cidadeSlug={cidadeSlug}
          isLoadingCidades={isLoadingCidades}
          errorCidades={errorCidades}
          isSubmitting={isLoading}
          validationError={validationError}
          onCidadeChange={handleCidadeChange}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <EmptyState
            title="Buscando hotéis..."
            description="Isso pode levar alguns segundos."
          />
        ) : null}

        {!isLoading && error ? (
          <EmptyState
            title="Não foi possível buscar os hotéis. Tente novamente."
            description="Verifique sua conexão e tente novamente em instantes."
          />
        ) : null}

        {isEmpty ? (
          <EmptyState
            title="Nenhum hotel encontrado para esta cidade."
            description="Tente selecionar outra cidade."
          />
        ) : null}

        {hasResults && result ? (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <HotelMap
              center={result.center}
              hotels={hotels}
              selectedHotelId={selectedHotelId}
              onSelectHotel={setSelectedHotelId}
            />
            <HotelList
              hotels={hotels}
              selectedHotelId={selectedHotelId}
              onSelectHotel={setSelectedHotelId}
            />
          </div>
        ) : null}
      </div>
    </Section>
  );
}
