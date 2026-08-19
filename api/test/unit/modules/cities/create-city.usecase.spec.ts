jest.mock("@/core/database", () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
  },
}));

import sequelize from "@/core/database";
import { CreateCityUseCase } from "@/modules/cities/application/use-cases/create-city.usecase";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";
import { AppError } from "@/core/errors-app-error";

const tinyPng =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const dto = {
  name: "Nova",
  slug: "nova",
  state: "MS",
  summary: "Sum",
  description: "Descrição com mais de dez.",
  image: {
    base64: tinyPng,
    mimeType: "image/png" as const,
    filename: "x.png",
  },
  published: true,
};

const uploadedUrl = "https://cdn.example/public/cities/a.png";

describe("CreateCityUseCase", () => {
  const create = jest.fn();
  const findByName = jest.fn();
  const uploadPublicWebImage = jest.fn().mockResolvedValue({ url: uploadedUrl });
  const commit = jest.fn();
  const rollback = jest.fn();
  const sut = new CreateCityUseCase(
    { create } as never,
    { findByName } as never,
    { uploadPublicWebImage } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    commit.mockResolvedValue(undefined);
    rollback.mockResolvedValue(undefined);
    (sequelize.transaction as jest.Mock).mockResolvedValue({ commit, rollback });
    uploadPublicWebImage.mockResolvedValue({ url: uploadedUrl });
  });

  it("cria cidade e commita transação", async () => {
    findByName.mockResolvedValue(null);
    const created = new CityEntity({
      name: dto.name,
      slug: dto.slug,
      state: dto.state,
      summary: dto.summary,
      description: dto.description,
      imageUrl: uploadedUrl,
      published: dto.published,
      id: 9,
    });
    create.mockResolvedValue(created);
    const out = await sut.execute(dto);
    expect(out.id).toBe(9);
    expect(uploadPublicWebImage).toHaveBeenCalledWith(dto.image, "cities");
    expect(commit).toHaveBeenCalled();
    expect(rollback).not.toHaveBeenCalled();
  });

  it("lança AppError 409 se nome já existe", async () => {
    findByName.mockResolvedValue(new CityEntity({ ...createdProps(), id: 1 }));
    await expect(sut.execute(dto)).rejects.toBeInstanceOf(AppError);
    expect(create).not.toHaveBeenCalled();
  });

  it("rollback se create falhar", async () => {
    findByName.mockResolvedValue(null);
    create.mockRejectedValue(new Error("db"));
    await expect(sut.execute(dto)).rejects.toThrow("db");
    expect(rollback).toHaveBeenCalled();
  });
});

function createdProps() {
  return {
    name: dto.name,
    slug: dto.slug,
    state: dto.state,
    summary: dto.summary,
    description: dto.description,
    imageUrl: uploadedUrl,
    published: dto.published,
  };
}
