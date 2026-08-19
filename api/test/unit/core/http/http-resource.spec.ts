import { collection, created, noContent, ok, resource } from "@/core/http/http-resource";

describe("core/http/http-resource", () => {
  it("resource() deve montar Resource com data, links e meta", () => {
    const data = { id: 1, name: "John" };
    const links = {
      self: { href: "/users/1", method: "GET" as const },
    };
    const meta = { version: "1.0.0" };

    const result = resource(data, links, meta);

    expect(result).toEqual({
      data,
      links,
      meta,
    });
  });

  it("collection() deve montar CollectionResource com array, links e meta", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const links = {
      self: { href: "/users", method: "GET" as const },
    };
    const meta = { page: 1 };

    const result = collection(data, links, meta);

    expect(result).toEqual({
      data,
      links,
      meta,
    });
  });

  it("ok() deve retornar HttpResponse 200 com body", () => {
    const body = resource(
      { id: 1 },
      { self: { href: "/x", method: "GET" as const } },
      { version: "1" },
    );

    const resp = ok(body);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual(body);
  });

  it("created() deve retornar HttpResponse 201 com body", () => {
    const body = resource(
      { id: 1 },
      { self: { href: "/x", method: "GET" as const } },
      { version: "1" },
    );

    const resp = created(body);

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual(body);
  });

  it("noContent() deve retornar HttpResponse 204 com body null", () => {
    const resp = noContent();

    expect(resp.statusCode).toBe(204);
    expect(resp.body).toBeNull();
  });
});
