import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import { useAdminDashboardStats } from "@/domains/admin-cms/dashboard/hooks/useAdminDashboardStats";
import {
  eventEndDateOnly,
  formatDateOnlyBr,
} from "@/domains/admin-cms/dashboard/utils/closedEvents";

const skeletonBarClass: string =
  "h-9 w-16 rounded bg-zinc-200 motion-safe:animate-pulse motion-reduce:animate-none";

function StatCard(props: {
  label: string;
  value: string | number | null;
  isLoading: boolean;
}): ReactElement {
  const { label, value, isLoading } = props;

  return (
    <Card>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      {isLoading ? (
        <div className={`mt-2 ${skeletonBarClass}`} aria-hidden />
      ) : (
        <p className="mt-2 text-3xl font-bold text-zinc-900">{value ?? "—"}</p>
      )}
    </Card>
  );
}

export function AdminDashboardPage(): ReactElement {
  const { stats, closedEvents, isLoading, error } = useAdminDashboardStats();

  const publishedClosedCount: number = closedEvents.filter(
    (event) => event.published,
  ).length;

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Painel"
        tone="primary"
        description="Visão inicial da área administrativa do Celeiro do MS."
      >
        Dashboard
      </SectionHeader>

      {error ? (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </Card>
      ) : null}

      <div
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        {...(isLoading
          ? {
              role: "status",
              "aria-live": "polite" as const,
              "aria-label": "Carregando totais do painel",
            }
          : {})}
      >
        <StatCard
          label="Cidades"
          value={stats?.cityCount ?? null}
          isLoading={isLoading}
        />
        <StatCard
          label="Eventos"
          value={stats?.eventCount ?? null}
          isLoading={isLoading}
        />
        <StatCard
          label="Pontos turísticos"
          value={stats?.touristPointCount ?? null}
          isLoading={isLoading}
        />
        <StatCard
          label="Destaques da home"
          value={stats?.homeHighlightCount ?? null}
          isLoading={isLoading}
        />
      </div>

      {!isLoading && !error ? (
        <Card
          className={
            closedEvents.length > 0
              ? "border border-amber-200 bg-amber-50"
              : "border border-emerald-200 bg-emerald-50"
          }
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-zinc-900">
              Eventos encerrados
            </h2>
            {closedEvents.length > 0 ? (
              <p className="text-sm leading-6 text-zinc-700">
                <span className="font-semibold text-amber-800">
                  {closedEvents.length}
                </span>{" "}
                {closedEvents.length === 1
                  ? "evento já passou"
                  : "eventos já passaram"}{" "}
                da data de término.{" "}
                {publishedClosedCount > 0 ? (
                  <span className="font-medium text-amber-800">
                    {publishedClosedCount}{" "}
                    {publishedClosedCount === 1
                      ? "ainda está publicado"
                      : "ainda estão publicados"}{" "}
                    e aparece(m) no site.
                  </span>
                ) : (
                  "Nenhum deles está publicado no site."
                )}
              </p>
            ) : (
              <p className="text-sm leading-6 text-emerald-800">
                Nenhum evento encerrado. Tudo em dia. ✅
              </p>
            )}
          </div>

          {closedEvents.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-zinc-500">
                    <th className="py-2 pr-4">Evento</th>
                    <th className="py-2 pr-4">Término</th>
                    <th className="py-2 pr-4">Situação no site</th>
                    <th className="py-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {closedEvents.map((event) => (
                    <tr key={event.id} className="border-b border-amber-100">
                      <td className="py-3 pr-4 font-medium text-zinc-800">
                        {event.name}
                      </td>
                      <td className="py-3 pr-4 text-zinc-600">
                        {formatDateOnlyBr(eventEndDateOnly(event))}
                      </td>
                      <td className="py-3 pr-4">
                        {event.published ? (
                          <span className="font-medium text-amber-700">
                            Publicado (visível)
                          </span>
                        ) : (
                          <span className="text-zinc-500">Rascunho (oculto)</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to="/admin/eventos/editar"
                          state={{ id: event.id }}
                        >
                          <Button variant="secondary" size="sm">
                            Gerenciar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900">Navegação</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Use o menu lateral para gerenciar cidades, eventos, pontos turísticos,
          conteúdo da home, institucional e demais módulos.
        </p>
      </Card>
    </div>
  );
}
