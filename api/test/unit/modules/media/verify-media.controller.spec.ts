import { VerifyMediaController } from "@/modules/media/presentation/http/controllers/verify-media.controller";
import { AppError } from "@/core/errors-app-error";

describe("VerifyMediaController", () => {
  const makeSut = () => {
    const useCaseMock = {
      execute: jest.fn(async () => ({
        url: "https://bucket.s3.amazonaws.com/public/a.png",
        contentType: "image/png",
        contentLength: 5,
      })),
    };
    const sut = new VerifyMediaController(useCaseMock as any);
    return { sut, useCaseMock };
  };

  it("retorna 200 com Resource quando verify ok", async () => {
    const { sut, useCaseMock } = makeSut();
    const req = {
      correlationId: "c1",
      validatedQuery: {
        url: "https://bucket.s3.amazonaws.com/public/a.png",
      },
    } as any;

    const resp = await sut.handle(req);

    expect(useCaseMock.execute).toHaveBeenCalledWith(req.validatedQuery.url);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.data).toMatchObject({
      url: "https://bucket.s3.amazonaws.com/public/a.png",
      contentType: "image/png",
      contentLength: 5,
      readable: true,
    });
  });

  it("mapeia AppError", async () => {
    const { sut, useCaseMock } = makeSut();
    useCaseMock.execute.mockRejectedValueOnce(
      new AppError({
        code: "MEDIA_NOT_READABLE",
        message: "nope",
        statusCode: 404,
      }),
    );

    const resp = await sut.handle({
      correlationId: "c2",
      validatedQuery: { url: "https://x" },
    } as any);

    expect(resp.statusCode).toBe(404);
  });
});
