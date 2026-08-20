import type { ReactElement } from "react";
import { Card } from "@/design-system/ui";
import { cn } from "@/design-system/utils/cn";

interface IMaintenanceModeCardProps {
  enabled: boolean;
  isSaving: boolean;
  onToggle: (next: boolean) => void;
}

export function MaintenanceModeCard({
  enabled,
  isSaving,
  onToggle,
}: IMaintenanceModeCardProps): ReactElement {
  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-zinc-900">
          Status do site
        </h2>
        <p className="text-sm text-zinc-600">
          Controle se o site público está disponível para os visitantes.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Modo de manutenção"
          disabled={isSaving}
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            enabled ? "bg-red-500" : "bg-emerald-500",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-7" : "translate-x-1",
            )}
          />
        </button>

        <span className="text-sm font-medium text-zinc-800">
          {enabled ? "🔴 Site em manutenção" : "🟢 Site público"}
        </span>
      </div>
    </Card>
  );
}
