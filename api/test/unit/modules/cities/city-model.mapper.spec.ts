import { cityModelToEntity } from "@/modules/cities/infra/mappers/city-model.mapper";
import { CityModel } from "@/modules/cities/infra/models/city-model";

describe("cityModelToEntity", () => {
  it("mapeia instância mínima", () => {
    const m = {
      id: 1,
      name: "N",
      slug: "n",
      state: "MS",
      summary: "S",
      description: "D",
      imageUrl: "https://x.com/i.jpg",
      published: true,
    } as CityModel;
    const e = cityModelToEntity(m);
    expect(e.id).toBe(1);
    expect(e.slug).toBe("n");
  });
});
