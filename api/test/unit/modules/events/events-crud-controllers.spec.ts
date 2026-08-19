import { CreateEventController } from "@/modules/events/presentation/http/controllers/create-event.controller";
import { DeleteEventController } from "@/modules/events/presentation/http/controllers/delete-event.controller";
import { GetEventByIdController } from "@/modules/events/presentation/http/controllers/get-event-by-id.controller";
import { UpdateEventController } from "@/modules/events/presentation/http/controllers/update-event.controller";
import { EventEntity } from "@/modules/events/domain/entities/event.entity";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const entity = new EventEntity({
  id: 7,
  cityId: 1,
  citySlug: "cg",
  name: "Fest",
  description: "D",
  category: "show",
  startDate: new Date(),
  endDate: new Date(),
  formattedDate: "—",
  location: "L",
  imageUrl: "https://x.com/e.jpg",
  featured: false,
  published: true,
});

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const createDto = {
  cityId: 1,
  citySlug: "cg",
  name: "Fest",
  description: "Descrição do evento aqui",
  category: "show" as const,
  startDate: new Date(),
  endDate: new Date(),
  formattedDate: "—",
  location: "L",
  image: { base64: tinyPngB64, mimeType: "image/png" as const },
  featured: false,
  published: true,
};

describe("CreateEventController", () => {
  const execute = jest.fn();
  const sut = new CreateEventController({ execute } as never);

  it("201 e erro", async () => {
    execute.mockResolvedValue(entity);
    const r = await sut.handle({ correlationId: "c", body: createDto });
    expect(r.statusCode).toBe(201);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", body: createDto })).statusCode).not.toBe(201);
  });
});

describe("GetEventByIdController", () => {
  const execute = jest.fn();
  const sut = new GetEventByIdController({ execute } as never);

  it("200 e erro", async () => {
    execute.mockResolvedValue(entity);
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).toBe(200);
    execute.mockRejectedValue(new Error("nf"));
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).not.toBe(
      200,
    );
  });
});

describe("DeleteEventController", () => {
  const execute = jest.fn();
  const sut = new DeleteEventController({ execute } as never);

  it("204 e erro", async () => {
    execute.mockResolvedValue(undefined);
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).toBe(204);
    execute.mockRejectedValue(new Error("x"));
    expect((await sut.handle({ correlationId: "c", params: { id: "7" } })).statusCode).not.toBe(
      204,
    );
  });
});

describe("UpdateEventController", () => {
  const execute = jest.fn();
  const sut = new UpdateEventController({ execute } as never);

  it("200 e erro", async () => {
    execute.mockResolvedValue(entity);
    const r = await sut.handle({
      correlationId: "c",
      params: { id: "7" },
      body: { name: "X" },
    });
    expect(r.statusCode).toBe(200);
    execute.mockRejectedValue(new Error("x"));
    expect(
      (
        await sut.handle({
          correlationId: "c",
          params: { id: "7" },
          body: {},
        })
      ).statusCode,
    ).not.toBe(200);
  });
});
