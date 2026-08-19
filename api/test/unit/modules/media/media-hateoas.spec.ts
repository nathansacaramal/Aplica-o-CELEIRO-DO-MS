import { uploadMediaSchema } from "../../../../src/modules/media/presentation/http/validators/media-schemas";

describe("media-schemas", () => {
  it("deve validar payload válido", () => {
    const parsed = uploadMediaSchema.safeParse({
      file: { base64: "abcdabcdabcd", filename: "a.png", mimeType: "image/png" },
      folder: "users/10",
      visibility: "public",
    });

    expect(parsed.success).toBe(true);
  });

  it("deve falhar quando file faltar", () => {
    const parsed = uploadMediaSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it("deve falhar quando base64 for muito curto", () => {
    const parsed = uploadMediaSchema.safeParse({
      file: { base64: "x", filename: "a.png", mimeType: "image/png" },
    });

    expect(parsed.success).toBe(false);
  });
});
