import { ListEventsUseCase } from "@/modules/events/application/use-cases/list-events.usecase";
import { ListEventsRepository } from "@/modules/events/domain/repositories/list-events.repository";
import { EventEntity } from "@/modules/events/domain/entities/event.entity";

const eventRow = new EventEntity({
  id: 1,
  cityId: 1,
  citySlug: "cg",
  name: "E",
  description: "D",
  category: "show",
  startDate: new Date(),
  endDate: new Date(),
  formattedDate: "hoje",
  location: "L",
  imageUrl: "https://x.com/e.jpg",
  featured: false,
  published: true,
});

describe("ListEventsUseCase", () => {
  const list = jest.fn();
  const repo: Pick<ListEventsRepository, "list"> = { list };
  const sut = new ListEventsUseCase(repo as ListEventsRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue({
      items: [eventRow],
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      sort: { by: "createdAt", dir: "desc" },
    });
  });

  it("normaliza page, limit e sort e chama o repositório", async () => {
    const out = await sut.execute({
      page: "2",
      limit: "5",
      sortBy: "name",
      sortDir: "ASC",
      name: "fest",
      category: "show",
      cityId: "3",
    });
    expect(list).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      filters: { name: "fest", category: "show", cityId: 3 },
      sort: { by: "name", dir: "asc" },
    });
    expect(out.items).toHaveLength(1);
    expect(out.total).toBe(25);
    expect(out.totalPages).toBe(5);
    expect(out.sort).toEqual({ by: "name", dir: "asc" });
  });

  it("usa defaults quando page/limit inválidos", async () => {
    await sut.execute({ page: -1, limit: 0 });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
  });
});
