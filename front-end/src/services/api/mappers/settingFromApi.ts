import type { ISiteSetting } from "@/entities/settings/settings.types";
import { toIsoDate } from "./toIsoDate";

export function mapSettingFromApi(raw: Record<string, unknown>): ISiteSetting {
  return {
    id: Number(raw.id),
    key: String(raw.key ?? ""),
    value: raw.value,
    updatedAt: toIsoDate(raw.updatedAt, new Date(0).toISOString()),
  };
}
