import { useCallback, useEffect, useState } from "react";
import type { ISiteSetting } from "@/entities/settings/settings.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminSettingsResult {
  settings: ISiteSetting[];
  setSettings: (value: ISiteSetting[]) => void;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminSettings(): IUseAdminSettingsResult {
  const [settings, setSettings] = useState<ISiteSetting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: ISiteSetting[] = await adminApiClient.getSettings();
      setSettings(response);
    } catch {
      setError("Não foi possível carregar as configurações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { settings, setSettings, isLoading, error, reload };
}
