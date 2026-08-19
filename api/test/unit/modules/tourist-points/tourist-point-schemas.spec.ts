import {
  createTouristPointSchema,
  listTouristPointsQuerySchema,
  updateTouristPointSchema,
} from "@/modules/tourist-points/presentation/http/validators/tourist-point-schemas";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const validCreate = {
  cityId: 1,
  citySlug: "campo-grande",
  name: "Parque",
  description: "Um parque na cidade",
  category: "parque" as const,
  address: "Rua A",
  openingHours: "09:00",
  image: { base64: tinyPngB64, mimeType: "image/png" as const },
  featured: true,
  published: true,
};

describe("tourist-point-schemas", () => {
  it("createTouristPointSchema aceita payload válido", () => {
    expect(createTouristPointSchema.safeParse(validCreate).success).toBe(true);
  });

  it("createTouristPointSchema rejeita nome curto e horário inválido", () => {
    expect(createTouristPointSchema.safeParse({ ...validCreate, name: "ab" }).success).toBe(false);
    expect(
      createTouristPointSchema.safeParse({ ...validCreate, openingHours: "25:00" }).success,
    ).toBe(false);
    expect(createTouristPointSchema.safeParse({ ...validCreate, category: "x" }).success).toBe(
      false,
    );
  });

  it("updateTouristPointSchema aceita vazio e parcial", () => {
    expect(updateTouristPointSchema.safeParse({}).success).toBe(true);
    expect(updateTouristPointSchema.safeParse({ name: "Novo nome" }).success).toBe(true);
  });

  it("createTouristPointSchema rejeita base64 curto e mime inválido", () => {
    expect(
      createTouristPointSchema.safeParse({
        ...validCreate,
        image: { base64: "1234567890123456789", mimeType: "image/png" },
      }).success,
    ).toBe(false);
    expect(
      createTouristPointSchema.safeParse({
        ...validCreate,
        image: { base64: tinyPngB64, mimeType: "image/svg+xml" },
      }).success,
    ).toBe(false);
  });

  it("updateTouristPointSchema rejeita nome curto e horário inválido quando presentes", () => {
    expect(updateTouristPointSchema.safeParse({ name: "ab" }).success).toBe(false);
    expect(updateTouristPointSchema.safeParse({ openingHours: "9:00" }).success).toBe(false);
  });
});

describe("listTouristPointsQuerySchema", () => {
  it("aplica defaults", () => {
    expect(listTouristPointsQuerySchema.parse({})).toMatchObject({
      page: 1,
      limit: 10,
    });
  });

  it("rejeita chave extra (.strict)", () => {
    expect(() => listTouristPointsQuerySchema.parse({ page: "1", foo: "1" })).toThrow();
  });

  it("rejeita limit acima de 50 e page < 1", () => {
    expect(() => listTouristPointsQuerySchema.parse({ limit: "51" })).toThrow();
    expect(() => listTouristPointsQuerySchema.parse({ page: "0" })).toThrow();
  });

  it("aceita filtros e ordenação válidos", () => {
    const out = listTouristPointsQuerySchema.parse({
      page: "2",
      limit: "20",
      name: "Museu",
      city: "CG",
      state: "MS",
      published: "true",
      sortBy: "name",
      sortDir: "desc",
    });
    expect(out).toMatchObject({
      page: 2,
      limit: 20,
      name: "Museu",
      sortBy: "name",
      sortDir: "desc",
    });
  });

  it("rejeita sortBy inválido", () => {
    expect(() => listTouristPointsQuerySchema.parse({ sortBy: "invalid" })).toThrow();
  });
});
