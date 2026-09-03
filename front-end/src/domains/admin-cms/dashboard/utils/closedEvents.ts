import type { IEvent } from "@/entities/event/event.types";

/** Extrai a parte YYYY-MM-DD de uma data ISO ("2026-09-01" ou "2026-09-01T..."). */
export function toDateOnly(value: string | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

/** Data local de hoje como YYYY-MM-DD (comparável lexicograficamente com datas ISO). */
export function localTodayDateOnly(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Data de término efetiva de um evento: usa `endDate` e, na falta dela,
 * `startDate` (evento de um dia só tem início).
 */
export function eventEndDateOnly(event: IEvent): string | null {
  return toDateOnly(event.endDate) ?? toDateOnly(event.startDate);
}

/** Formata YYYY-MM-DD como DD/MM/YYYY sem passar por Date (evita deslocamento de fuso). */
export function formatDateOnlyBr(dateOnly: string | null): string {
  if (!dateOnly) return "Data não informada";
  const [year, month, day] = dateOnly.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Eventos já encerrados: aqueles cuja data de término é anterior a hoje.
 * Um evento que termina hoje ainda NÃO é considerado encerrado.
 * Eventos sem nenhuma data não entram (não dá para afirmar que passaram).
 * Ordenados do mais recentemente encerrado para o mais antigo.
 */
export function getClosedEvents(
  events: IEvent[],
  todayDateOnly: string = localTodayDateOnly(),
): IEvent[] {
  return events
    .filter((event) => {
      const end = eventEndDateOnly(event);
      return end !== null && end < todayDateOnly;
    })
    .sort((a, b) => {
      const ea = eventEndDateOnly(a) ?? "";
      const eb = eventEndDateOnly(b) ?? "";
      return eb.localeCompare(ea);
    });
}
