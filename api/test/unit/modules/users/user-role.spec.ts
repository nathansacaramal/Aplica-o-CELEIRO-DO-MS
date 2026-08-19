import {
  UserRoleEnum,
  UserRoleEnumLiteral,
  UserRoles,
} from "@/modules/users/domain/value-objects/user-role";
import { isTouristPointCategory } from "@/modules/tourist-points/domain/value-objects/tourist-point-category";

describe("user-role exports", () => {
  it("roles e enum", () => {
    expect(UserRoles).toContain("Admin");
    expect(UserRoleEnumLiteral.Admin).toBe("Admin");
    expect(UserRoleEnum.Admin).toBe("Admin");
  });
});

describe("isTouristPointCategory", () => {
  it("valida categorias de ponto turístico", () => {
    expect(isTouristPointCategory("parque")).toBe(true);
    expect(isTouristPointCategory("invalid")).toBe(false);
  });
});
