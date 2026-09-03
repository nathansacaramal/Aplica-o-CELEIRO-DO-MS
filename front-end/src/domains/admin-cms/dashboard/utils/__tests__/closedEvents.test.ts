import { describe, expect, it } from "vitest";
import type { IEvent } from "@/entities/event/event.types";
import {
  eventEndDateOnly,
  formatDateOnlyBr,
  getClosedEvents,
  localTodayDateOnly,
  toDateOnly,
} from "../closedEvents";

function makeEvent(overrides: Partial<IEvent>): IEvent {
  return {
    id: 1,
    cityId: 1,
    citySlug: "c",
    slug: "s",
    name: "Evento",
    description: "",
    featured: false,
    published: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("toDateOnly", () => {
  it("extrai YYYY-MM-DD de data pura e de ISO com hora", () => {
    expect(toDateOnly("2026-09-01")).toBe("2026-09-01");
    expect(toDateOnly("2026-09-01T13:00:00.000Z")).toBe("2026-09-01");
    expect(toDateOnly(undefined)).toBeNull();
    expect(toDateOnly("")).toBeNull();
  });
});

describe("localTodayDateOnly", () => {
  it("formata a data local como YYYY-MM-DD", () => {
    expect(localTodayDateOnly(new Date(2026, 8, 3))).toBe("2026-09-03");
    expect(localTodayDateOnly(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("eventEndDateOnly", () => {
  it("usa endDate quando presente", () => {
    expect(eventEndDateOnly(makeEvent({ endDate: "2026-09-02", startDate: "2026-09-01" }))).toBe(
      "2026-09-02",
    );
  });
  it("cai no startDate quando não há endDate", () => {
    expect(eventEndDateOnly(makeEvent({ endDate: undefined, startDate: "2026-09-01" }))).toBe(
      "2026-09-01",
    );
  });
  it("retorna null quando o evento não tem datas", () => {
    expect(eventEndDateOnly(makeEvent({ endDate: undefined, startDate: undefined }))).toBeNull();
  });
});

describe("formatDateOnlyBr", () => {
  it("formata DD/MM/YYYY sem deslocar fuso", () => {
    expect(formatDateOnlyBr("2026-09-01")).toBe("01/09/2026");
  });
  it("rótulo amigável quando não há data", () => {
    expect(formatDateOnlyBr(null)).toBe("Data não informada");
  });
});

describe("getClosedEvents", () => {
  const hoje = "2026-09-03";

  it("inclui evento cujo término já passou", () => {
    const events = [makeEvent({ id: 1, endDate: "2026-09-01" })];
    expect(getClosedEvents(events, hoje).map((e) => e.id)).toEqual([1]);
  });

  it("NÃO inclui evento que termina hoje", () => {
    const events = [makeEvent({ id: 2, endDate: "2026-09-03" })];
    expect(getClosedEvents(events, hoje)).toEqual([]);
  });

  it("NÃO inclui evento futuro", () => {
    const events = [makeEvent({ id: 3, endDate: "2026-12-25" })];
    expect(getClosedEvents(events, hoje)).toEqual([]);
  });

  it("ignora evento sem datas", () => {
    const events = [makeEvent({ id: 4, endDate: undefined, startDate: undefined })];
    expect(getClosedEvents(events, hoje)).toEqual([]);
  });

  it("ordena do mais recentemente encerrado para o mais antigo", () => {
    const events = [
      makeEvent({ id: 1, endDate: "2026-08-10" }),
      makeEvent({ id: 2, endDate: "2026-09-01" }),
      makeEvent({ id: 3, endDate: "2026-07-15" }),
    ];
    expect(getClosedEvents(events, hoje).map((e) => e.id)).toEqual([2, 1, 3]);
  });
});
