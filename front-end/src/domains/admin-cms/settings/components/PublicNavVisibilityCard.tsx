import type { ReactElement } from "react";
import { Card } from "@/design-system/ui";
import { cn } from "@/design-system/utils/cn";
import {
  PUBLIC_NAV_ITEMS,
  type PublicNavItemId,
} from "@/constants/publicNavItems";

interface IPublicNavVisibilityCardProps {
  hidden: PublicNavItemId[];
  isSaving: boolean;
  onToggle: (id: PublicNavItemId, nextVisible: boolean) => void;
}

export function PublicNavVisibilityCard({
  hidden,
  isSaving,
  onToggle,
}: IPublicNavVisibilityCardProps): ReactElement {
  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-zinc-900">Menu do site</h2>
        <p className="text-sm text-zinc-600">
          Escolha quais itens aparecem na barra de navegação do site público. A
          Home não pode ser escondida.
        </p>
      </div>

      <ul className="divide-y divide-zinc-100">
        {PUBLIC_NAV_ITEMS.map((item) => {
          const isVisible: boolean = !hidden.includes(item.id);

          return (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-800">{item.label}</span>
                <span className="text-xs text-zinc-500">{item.path}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600">
                  {isVisible ? "Visível" : "Escondido"}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  aria-label={`Mostrar ${item.label} no menu`}
                  disabled={isSaving}
                  onClick={() => onToggle(item.id, !isVisible)}
                  className={cn(
                    "inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    isVisible ? "bg-emerald-500" : "bg-zinc-300",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      isVisible ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
