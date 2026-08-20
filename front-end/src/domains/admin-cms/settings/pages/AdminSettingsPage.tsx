import { useState, type ReactElement } from "react";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type { ISiteSetting } from "@/entities/settings/settings.types";
import { MaintenanceModeCard } from "@/domains/admin-cms/settings/components/MaintenanceModeCard";
import { useAdminSettings } from "@/domains/admin-cms/settings/hooks/useAdminSettings";
import { adminApiClient } from "@/services/admin-api/client";
import { toApiError } from "@/services/api/apiError";

const MAINTENANCE_MODE_KEY = "maintenance_mode";

function isMaintenanceModeEnabled(settings: ISiteSetting[]): boolean {
  const setting = settings.find((item) => item.key === MAINTENANCE_MODE_KEY);
  const value = setting?.value as { enabled?: unknown } | undefined;
  return value?.enabled === true;
}

export function AdminSettingsPage(): ReactElement {
  const { settings, setSettings, isLoading, error: loadError, reload } =
    useAdminSettings();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const maintenanceModeEnabled: boolean = isMaintenanceModeEnabled(settings);

  async function handleToggleMaintenanceMode(next: boolean): Promise<void> {
    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      const updated: ISiteSetting = await adminApiClient.updateSetting(
        MAINTENANCE_MODE_KEY,
        { enabled: next },
      );

      setSettings(
        settings.some((item) => item.key === MAINTENANCE_MODE_KEY)
          ? settings.map((item) =>
              item.key === MAINTENANCE_MODE_KEY ? updated : item,
            )
          : [...settings, updated],
      );

      setSuccessMessage(
        next
          ? "Site colocado em modo de manutenção."
          : "Site público reativado.",
      );
    } catch (caught) {
      setError(
        toApiError(caught, "Não foi possível salvar a configuração.").message,
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          kicker="Admin CMS"
          tone="primary"
          description="Carregando configurações."
        >
          Configurações
        </SectionHeader>

        <Card>
          <p className="text-sm text-zinc-600">Carregando dados...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Admin CMS"
        tone="primary"
        description="Parâmetros gerais do sistema."
      >
        Configurações
      </SectionHeader>

      {error || loadError ? (
        <Card className="border border-red-200 bg-red-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">
              {error || loadError}
            </p>
            {loadError ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isLoading}
                onClick={() => void reload()}
              >
                Tentar novamente
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="border border-emerald-200 bg-emerald-50">
          <p className="text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        </Card>
      ) : null}

      {/* Novas configurações entram aqui como Cards independentes, sem
          precisar alterar a estrutura desta página. */}
      <MaintenanceModeCard
        enabled={maintenanceModeEnabled}
        isSaving={isSaving}
        onToggle={(next) => void handleToggleMaintenanceMode(next)}
      />
    </div>
  );
}
