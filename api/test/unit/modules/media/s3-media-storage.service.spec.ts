import crypto from "crypto";
import { S3MediaStorageService } from "../../../../src/modules/media/infra/storage/s3-media-storage.service";

const sendMock = jest.fn();

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send: sendMock })),
    PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
    HeadObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});

import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

describe("S3MediaStorageService", () => {
  beforeEach(() => {
    sendMock.mockReset();
    (PutObjectCommand as unknown as jest.Mock).mockClear();
    (HeadObjectCommand as unknown as jest.Mock).mockClear();
  });

  it("deve enviar PutObjectCommand e retornar path s3://... (public)", async () => {
    jest.spyOn(crypto, "randomUUID").mockReturnValue("uuid-1-uuid-1-uuid-1-uuid-1");

    const svc = new S3MediaStorageService({
      bucket: "my-bucket",
      region: "us-east-1",
      publicBaseUrl: "https://my-bucket.s3.amazonaws.com",
      publicKeyPrefix: "public",
      defaultStorageClass: "STANDARD",
    });

    const buffer = Buffer.from("hello");

    const result = await svc.save({
      filename: "foto.png",
      mimeType: "image/png",
      buffer,
      folder: "/users/10",
      visibility: "public",
    });

    expect(PutObjectCommand).toHaveBeenCalledTimes(1);
    const cmdArg = (PutObjectCommand as unknown as jest.Mock).mock.calls[0][0];

    expect(cmdArg).toEqual(
      expect.objectContaining({
        Bucket: "my-bucket",
        Key: "public/users/10/uuid-1-uuid-1-uuid-1-uuid-1.png",
        Body: buffer,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000, immutable",
        StorageClass: "STANDARD",
      }),
    );

    expect(sendMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(
      expect.objectContaining({
        path: "s3://my-bucket/public/users/10/uuid-1-uuid-1-uuid-1-uuid-1.png",
        url: "https://my-bucket.s3.amazonaws.com/public/users/10/uuid-1-uuid-1-uuid-1-uuid-1.png",
        size: 5,
        mimeType: "image/png",
      }),
    );
  });

  it("não deve setar ACL quando visibility for private", async () => {
    jest.spyOn(crypto, "randomUUID").mockReturnValue("uuid-2-uuid-2-uuid-2-uuid-2");

    const svc = new S3MediaStorageService({
      bucket: "my-bucket",
      region: "us-east-1",
      publicBaseUrl: "https://my-bucket.s3.amazonaws.com",
      publicKeyPrefix: "public",
      defaultStorageClass: "STANDARD",
    });

    await svc.save({
      filename: "x.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("abc"),
      visibility: "private",
    });

    const cmdArg = (PutObjectCommand as unknown as jest.Mock).mock.calls[0][0];
    expect(cmdArg.ACL).toBeUndefined();
  });

  it("headOwnedPublicUrl envia HeadObject e retorna metadados", async () => {
    sendMock.mockResolvedValueOnce({
      ContentType: "image/png",
      ContentLength: 99,
    });

    const svc = new S3MediaStorageService({
      bucket: "my-bucket",
      region: "us-east-1",
      publicBaseUrl: "https://my-bucket.s3.amazonaws.com",
      publicKeyPrefix: "public",
      defaultStorageClass: "STANDARD",
    });

    const url = "https://my-bucket.s3.amazonaws.com/public/phase1/uuid.png";
    const meta = await svc.headOwnedPublicUrl(url);

    expect(HeadObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "my-bucket",
        Key: "public/phase1/uuid.png",
      }),
    );
    expect(meta).toEqual({
      contentType: "image/png",
      contentLength: 99,
    });
  });

  it("headOwnedPublicUrl retorna null para URL fora do prefixo público", async () => {
    const svc = new S3MediaStorageService({
      bucket: "my-bucket",
      region: "us-east-1",
      publicBaseUrl: "https://my-bucket.s3.amazonaws.com",
      publicKeyPrefix: "public",
      defaultStorageClass: "STANDARD",
    });

    const meta = await svc.headOwnedPublicUrl("https://my-bucket.s3.amazonaws.com/private/x.png");
    expect(meta).toBeNull();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("headOwnedPublicUrl retorna null em 404 do S3", async () => {
    sendMock.mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } });

    const svc = new S3MediaStorageService({
      bucket: "my-bucket",
      region: "us-east-1",
      publicBaseUrl: "https://my-bucket.s3.amazonaws.com/",
      publicKeyPrefix: "public",
      defaultStorageClass: "STANDARD",
    });

    const meta = await svc.headOwnedPublicUrl(
      "https://my-bucket.s3.amazonaws.com/public/missing.png",
    );
    expect(meta).toBeNull();
  });
});
