import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from "@/modules/users/presentation/http/validators/user-schemas";

describe("user-schemas", () => {
  describe("updateUserSchema", () => {
    it("aceita objeto vazio (todos os campos opcionais)", () => {
      expect(updateUserSchema.parse({})).toEqual({});
    });

    it("aceita atualização parcial válida", () => {
      expect(
        updateUserSchema.parse({
          name: "Novo Nome",
          email: "novo@example.com",
        }),
      ).toEqual({
        name: "Novo Nome",
        email: "novo@example.com",
      });
    });

    it("rejeita nome com menos de 3 caracteres", () => {
      expect(() => updateUserSchema.parse({ name: "Ab" })).toThrow();
    });

    it("rejeita nome quando não é string", () => {
      expect(() => updateUserSchema.parse({ name: 123 as unknown as string })).toThrow();
    });

    it("rejeita email inválido", () => {
      expect(() => updateUserSchema.parse({ email: "nao-e-email" })).toThrow();
    });

    it("rejeita senha curta", () => {
      expect(() => updateUserSchema.parse({ password: "12345" })).toThrow();
    });

    it("rejeita senha quando não é string", () => {
      expect(() => updateUserSchema.parse({ password: 123456 as unknown as string })).toThrow();
    });

    it("rejeita role inválida", () => {
      expect(() => updateUserSchema.parse({ role: "SuperAdmin" as "Admin" })).toThrow();
    });

    it("aceita role Admin", () => {
      expect(updateUserSchema.parse({ role: "Admin" })).toEqual({
        role: "Admin",
      });
    });
  });

  describe("listUsersQuerySchema", () => {
    it("aplica defaults e aceita query mínima", () => {
      expect(listUsersQuerySchema.parse({})).toMatchObject({
        page: 1,
        limit: 10,
        sortDir: "asc",
      });
    });

    it("rejeita chaves não listadas (.strict)", () => {
      expect(() => listUsersQuerySchema.parse({ page: "1", foo: "bar" })).toThrow();
    });

    it("rejeita page menor que 1", () => {
      expect(() => listUsersQuerySchema.parse({ page: "0" })).toThrow();
    });

    it("rejeita limit acima do máximo", () => {
      expect(() => listUsersQuerySchema.parse({ limit: "101" })).toThrow();
    });

    it("aceita filtros e ordenação opcionais", () => {
      const out = listUsersQuerySchema.parse({
        page: "2",
        limit: "20",
        name: "Maria",
        email: "a@b.com",
        sortBy: "email",
        sortDir: "desc",
      });
      expect(out).toMatchObject({
        page: 2,
        limit: 20,
        name: "Maria",
        email: "a@b.com",
        sortBy: "email",
        sortDir: "desc",
      });
    });
  });

  describe("createUserSchema", () => {
    it("aceita payload válido", () => {
      const out = createUserSchema.parse({
        name: "João Silva",
        email: "joao@example.com",
        password: "senha12",
        role: "Admin",
      });
      expect(out.role).toBe("Admin");
      expect(out.email).toBe("joao@example.com");
    });

    it("rejeita nome curto", () => {
      expect(() =>
        createUserSchema.parse({
          name: "Jo",
          email: "j@e.com",
          password: "senha12",
          role: "Admin",
        }),
      ).toThrow();
    });
  });
});
