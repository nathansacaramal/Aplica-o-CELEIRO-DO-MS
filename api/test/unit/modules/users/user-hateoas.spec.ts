import { userLinks } from "@/modules/users/presentation/http/user-hateoas";

describe("user-hateoas", () => {
  it("deve gerar links básicos para um userId", () => {
    const links = userLinks(10);

    expect(links).toEqual({
      self: { href: "/api/admin/users/10", method: "GET" },
      update: { href: "/api/admin/users/10", method: "PATCH" },
      delete: { href: "/api/admin/users/10", method: "DELETE" },
      list: { href: "/api/admin/users", method: "GET" },
    });

    // asserts “de segurança” (opcional)
    expect(Object.keys(links)).toEqual(
      expect.arrayContaining(["self", "update", "delete", "list"]),
    );
  });
});
