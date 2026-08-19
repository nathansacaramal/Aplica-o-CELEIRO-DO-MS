import { AppError } from "@/core/errors-app-error";
import type { MediaStorageService } from "@/modules/media/domain/services/media-storage.service";
import { VerifyPublicMediaReadableUseCase } from "@/modules/media/application/use-cases/verify-public-media-readable.usecase";

describe("VerifyPublicMediaReadableUseCase", () => {
  it("retorna metadados quando headOwnedPublicUrl resolve", async () => {
    const storage: Pick<MediaStorageService, "headOwnedPublicUrl"> = {
      headOwnedPublicUrl: jest.fn().mockResolvedValue({
        contentType: "image/png",
        contentLength: 10,
      }),
    };
    const sut = new VerifyPublicMediaReadableUseCase(storage as MediaStorageService);
    const out = await sut.execute("https://b.s3.amazonaws.com/public/x.png");
    expect(out).toEqual({
      url: "https://b.s3.amazonaws.com/public/x.png",
      contentType: "image/png",
      contentLength: 10,
    });
  });

  it("lança AppError 404 quando head retorna null", async () => {
    const storage: Pick<MediaStorageService, "headOwnedPublicUrl"> = {
      headOwnedPublicUrl: jest.fn().mockResolvedValue(null),
    };
    const sut = new VerifyPublicMediaReadableUseCase(storage as MediaStorageService);
    await expect(sut.execute("https://x")).rejects.toBeInstanceOf(AppError);
    await expect(sut.execute("https://y")).rejects.toMatchObject({
      code: "MEDIA_NOT_READABLE",
      statusCode: 404,
    });
  });
});
