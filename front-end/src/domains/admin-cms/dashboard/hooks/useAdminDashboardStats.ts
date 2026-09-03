import { useCallback, useEffect, useState } from "react";
import type { IEvent } from "@/entities/event/event.types";
import { getClosedEvents } from "@/domains/admin-cms/dashboard/utils/closedEvents";
import { adminApiClient } from "@/services/admin-api/client";

export interface IAdminDashboardStats {
  cityCount: number;
  eventCount: number;
  touristPointCount: number;
  homeHighlightCount: number;
}

export interface IUseAdminDashboardStatsResult {
  stats: IAdminDashboardStats | null;
  /** Eventos cuja data de término já passou — candidatos a remover do site. */
  closedEvents: IEvent[];
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminDashboardStats(): IUseAdminDashboardStatsResult {
  const [stats, setStats] = useState<IAdminDashboardStats | null>(null);
  const [closedEvents, setClosedEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const [cities, events, touristPoints, homeHighlights] = await Promise.all(
        [
          adminApiClient.listCities(),
          adminApiClient.listEvents(),
          adminApiClient.listTouristPoints(),
          adminApiClient.listHomeHighlights(),
        ],
      );

      setStats({
        cityCount: cities.length,
        eventCount: events.length,
        touristPointCount: touristPoints.length,
        homeHighlightCount: homeHighlights.length,
      });
      setClosedEvents(getClosedEvents(events));
    } catch {
      setError("Não foi possível carregar os totais do painel.");
      setStats(null);
      setClosedEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, closedEvents, isLoading, error, reload };
}
