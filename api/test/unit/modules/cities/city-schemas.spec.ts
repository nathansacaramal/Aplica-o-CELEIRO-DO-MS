import {
  createCitySchema,
  deleteCityParamsSchema,
  getCityParamsSchema,
  listCitiesQuerySchema,
  updateCitySchema,
} from "@/modules/cities/presentation/http/validators/city-schemas";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const validCreate = {
  name: "Campo Grande",
  slug: "campo-grande",
  state: "MS",
  summary: "Resumo ok",
  description: "Descrição com mais de dez chars.",
  image: {
    base64: tinyPngB64,
    mimeType: "image/png" as const,
  },
  published: true,
};

describe("city-schemas", () => {
  it("createCitySchema aceita payload válido", () => {
    expect(createCitySchema.safeParse(validCreate).success).toBe(true);
  });

  it("createCitySchema rejeita nome curto", () => {
    expect(createCitySchema.safeParse({ ...validCreate, name: "ab" }).success).toBe(false);
  });

  it("updateCitySchema aceita parcial", () => {
    expect(updateCitySchema.safeParse({ name: "Nova" }).success).toBe(true);
  });

  it("getCityParamsSchema exige id numérico string", () => {
    expect(getCityParamsSchema.safeParse({ id: "12" }).success).toBe(true);
    expect(getCityParamsSchema.safeParse({ id: "x" }).success).toBe(false);
  });

  it("deleteCityParamsSchema igual a get", () => {
    expect(deleteCityParamsSchema.safeParse({ id: "1" }).success).toBe(true);
  });

  it("listCitiesQuerySchema opcional page/limit", () => {
    expect(listCitiesQuerySchema.safeParse({}).success).toBe(true);
    expect(listCitiesQuerySchema.safeParse({ page: "2" }).success).toBe(true);
  });

  it("createCitySchema cobre erros de tipo / obrigatoriedade", () => {
    expect(createCitySchema.safeParse({ ...validCreate, name: undefined }).success).toBe(false);
    expect(createCitySchema.safeParse({ ...validCreate, slug: 1 }).success).toBe(false);
    expect(createCitySchema.safeParse({ ...validCreate, state: "MST" }).success).toBe(false);
    expect(createCitySchema.safeParse({ ...validCreate, description: "curta" }).success).toBe(
      false,
    );
    expect(
      createCitySchema.safeParse({
        ...validCreate,
        image: { base64: "curto", mimeType: "image/png" },
      }).success,
    ).toBe(false);
  });

  it("updateCitySchema rejeita tipos inválidos quando campo presente", () => {
    expect(updateCitySchema.safeParse({ name: 1 }).success).toBe(false);
    expect(updateCitySchema.safeParse({ published: "sim" }).success).toBe(false);
  });

  it("getCityParamsSchema mensagens de id ausente / inválido", () => {
    expect(getCityParamsSchema.safeParse({}).success).toBe(false);
    expect(getCityParamsSchema.safeParse({ id: "1.2" }).success).toBe(false);
  });

  it("listCitiesQuerySchema page/limit não numéricos", () => {
    expect(listCitiesQuerySchema.safeParse({ page: "a" }).success).toBe(false);
    expect(listCitiesQuerySchema.safeParse({ limit: "x" }).success).toBe(false);
  });

  it("createCitySchema rejeita resumo curto", () => {
    expect(createCitySchema.safeParse({ ...validCreate, summary: "ab" }).success).toBe(false);
  });

  it("updateCitySchema rejeita slug curto e descrição curta quando informados", () => {
    expect(updateCitySchema.safeParse({ slug: "ab" }).success).toBe(false);
    expect(updateCitySchema.safeParse({ description: "123456789" }).success).toBe(false);
  });

  it("updateCitySchema aceita imagem opcional válida", () => {
    expect(
      updateCitySchema.safeParse({
        image: { base64: tinyPngB64, mimeType: "image/png" },
      }).success,
    ).toBe(true);
  });
});
