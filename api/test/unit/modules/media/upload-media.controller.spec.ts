import { UploadMediaController } from "../../../../src/modules/media/presentation/http/controllers/upload-media.controller";
import { AppError } from "../../../../src/core/errors-app-error";

describe("UploadMediaController", () => {
  const makeSut = () => {
    const useCaseMock = {
      execute: jest.fn(async () => ({
        filename: "foto.png",
        mimeType: "image/png",
        size: 123,
        path: "local://users/10/foto.png",
        url: "/uploads/users/10/foto.png",
      })),
    };

    const sut = new UploadMediaController(useCaseMock as any);

    return { sut, useCaseMock };
  };

  it("deve retornar 200 (ok) com Resource", async () => {
    const { sut, useCaseMock } = makeSut();

    const req = {
      correlationId: "corr-1",
      body: {
        file: { base64: "xxx", filename: "foto.png", mimeType: "image/png" },
        folder: "users/10",
      },
    } as any;

    const resp = await sut.handle(req);

    expect(useCaseMock.execute).toHaveBeenCalledWith(req.body);
    expect(resp.statusCode).toBe(200);

    // Resource shape: { data, links, meta }
    expect(resp.body).toHaveProperty("data");
    expect(resp.body).toHaveProperty("links");
    expect(resp.body).toHaveProperty("meta");

    expect(resp.body.data).toMatchObject({
      filename: "foto.png",
      mimeType: "image/png",
      size: 123,
      path: "local://users/10/foto.png",
      url: "/uploads/users/10/foto.png",
    });
  });

  it("deve mapear AppError para resposta http", async () => {
    const { sut, useCaseMock } = makeSut();

    useCaseMock.execute.mockRejectedValueOnce(
      new AppError({
        code: "MEDIA_INVALID_BASE64",
        message: "Arquivo inválido",
        statusCode: 400,
      }),
    );

    const req = {
      correlationId: "corr-2",
      body: { file: { base64: "bad", filename: "x", mimeType: "x" } },
    } as any;

    const resp = await sut.handle(req);

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "MEDIA_INVALID_BASE64",
          message: "Arquivo inválido",
        }),
      }),
    );
  });
});
