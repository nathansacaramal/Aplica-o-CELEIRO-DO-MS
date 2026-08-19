import { ListEventsController } from "@/modules/events/presentation/http/controllers/list-events.controller";
import { ListEventsUseCase } from "@/modules/events/application/use-cases/list-events.usecase";
import { EventEntity } from "@/modules/events/domain/entities/event.entity";

const entity = new EventEntity({
  id: 1,
  cityId: 1,
  citySlug: "cg",
  name: "Show",
  description: "Desc",
  category: "show",
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-01-02"),
  formattedDate: "Jan",
  location: "Centro",
  imageUrl: "https://x.com/i.jpg",
  featured: true,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const useCaseResult = {
  items: [entity],
  total: 30,
  page: 2,
  limit: 10,
  totalPages: 3,
  sort: { by: "name", dir: "asc" as const },
};

describe("ListEventsController", () => {
  const execute = jest.fn();
  const adminSut = new ListEventsController({ execute } as unknown as ListEventsUseCase, "admin");
  const publicSut = new ListEventsController({ execute } as unknown as ListEventsUseCase, "public");

  beforeEach(() => {
    jest.clearAllMocks();
    execute.mockResolvedValue(useCaseResult);
  });

  it("200 admin com query e categoria válida", async () => {
    const r = await adminSut.handle({
      correlationId: "c",
      query: {
        page: "2",
        limit: "10",
        name: "f",
        category: "show",
        cityId: "1",
        sortBy: "name",
        sortDir: "asc",
      },
    });
    expect(r.statusCode).toBe(200);
    expect(execute).toHaveBeenCalled();
  });

  it("ignora category inválida na query", async () => {
    await adminSut.handle({
      correlationId: "c",
      query: { category: "invalid_cat" },
    });
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ category: undefined }));
  });

  it("200 público usa links públicos", async () => {
    const r = await publicSut.handle({
      correlationId: "c",
      query: { page: "1" },
    });
    expect(r.statusCode).toBe(200);
    const body = r.body as { links: { self: { href: string } } };
    expect(body.links.self.href).toContain("/api/public/events");
  });
});
