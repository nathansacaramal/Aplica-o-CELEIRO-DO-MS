import BlogPostModel from "@/modules/blog/infra/model/blog-post-model";
import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";
import { BlogPostEntity } from "@/modules/blog/domain/entities/blog-post.entity";

jest.mock("@/modules/blog/infra/model/blog-post-model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

const row = {
  id: 7,
  titulo: "Fest",
  slug: "fest",
  resumo: "R",
  conteudo: "<p>C</p>",
  imagemDestaque: "https://x.com/e.jpg",
  status: "published",
  dataPublicacao: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeEntity = () =>
  new BlogPostEntity({
    id: 0,
    titulo: "Fest",
    slug: "fest",
    resumo: "R",
    conteudo: "<p>C</p>",
    imagemDestaque: "https://x.com/e.jpg",
    status: "published",
    dataPublicacao: new Date(),
  });

describe("SequelizeBlogPostRepository", () => {
  const repo = new SequelizeBlogPostRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create", async () => {
    (BlogPostModel.create as jest.Mock).mockResolvedValue({ ...row });
    const out = await repo.create(makeEntity());
    expect(out.id).toBe(7);
  });

  it("findById null e ok", async () => {
    (BlogPostModel.findByPk as jest.Mock).mockResolvedValueOnce(null);
    expect(await repo.findById(1)).toBeNull();
    (BlogPostModel.findByPk as jest.Mock).mockResolvedValueOnce({ ...row });
    expect((await repo.findById(7))?.titulo).toBe("Fest");
  });

  it("publicFindBySlug null e ok (apenas publicados)", async () => {
    (BlogPostModel.findOne as jest.Mock).mockResolvedValueOnce(null);
    expect(await repo.publicFindBySlug("x")).toBeNull();

    (BlogPostModel.findOne as jest.Mock).mockResolvedValueOnce({ ...row });
    const out = await repo.publicFindBySlug("fest");
    expect(out?.slug).toBe("fest");
    expect(BlogPostModel.findOne).toHaveBeenCalledWith({
      where: { slug: "fest", status: "published" },
    });
  });

  it("findBySlugAnyStatus não filtra por status", async () => {
    (BlogPostModel.findOne as jest.Mock).mockResolvedValueOnce({ ...row, status: "draft" });
    const out = await repo.findBySlugAnyStatus("fest");
    expect(out?.status).toBe("draft");
    expect(BlogPostModel.findOne).toHaveBeenCalledWith({ where: { slug: "fest" } });
  });

  it("update null quando registro não existe", async () => {
    (BlogPostModel.findByPk as jest.Mock).mockResolvedValueOnce(null);
    expect(await repo.update(7, { titulo: "X" })).toBeNull();
  });

  it("update aplica patch e retorna entidade", async () => {
    const found: Record<string, unknown> = { ...row };
    (found as { update: jest.Mock }).update = jest
      .fn()
      .mockImplementation(async (patch: Record<string, unknown>) => {
        Object.assign(found, patch);
      });
    (BlogPostModel.findByPk as jest.Mock).mockResolvedValueOnce(found);
    const out = await repo.update(7, { titulo: "Novo" });
    expect(out?.titulo).toBe("Novo");
  });

  it("delete", async () => {
    (BlogPostModel.destroy as jest.Mock).mockResolvedValue(1);
    expect(await repo.delete(7)).toBe(true);
  });

  it("list com paginação", async () => {
    (BlogPostModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [{ ...row }],
      count: 1,
    });
    const out = await repo.list({
      page: 1,
      limit: 10,
      filters: {},
      sort: { by: "dataPublicacao", dir: "desc" },
    });
    expect(out.items).toHaveLength(1);
    expect(out.total).toBe(1);
    expect(out.page).toBe(1);
  });

  it("list força status published quando onlyPublished, ignorando filtro de status", async () => {
    (BlogPostModel.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
    await repo.list({
      page: 1,
      limit: 10,
      filters: { status: "draft", onlyPublished: true },
      sort: { by: "dataPublicacao", dir: "desc" },
    });
    const where = (BlogPostModel.findAndCountAll as jest.Mock).mock.calls[0]![0].where;
    expect(where).toEqual({ status: "published" });
  });

  it("listLatestPublished ordena por dataPublicacao desc e filtra publicados", async () => {
    (BlogPostModel.findAll as jest.Mock).mockResolvedValue([{ ...row }]);
    const out = await repo.listLatestPublished(12);
    expect(out).toHaveLength(1);
    expect(BlogPostModel.findAll).toHaveBeenCalledWith({
      where: { status: "published" },
      order: [["dataPublicacao", "desc"]],
      limit: 12,
    });
  });
});
