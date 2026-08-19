import { UploadMediaUseCase } from "../../../../src/modules/media/application/use-cases/upload-media.usecase";
import { AppError } from "../../../../src/core/errors-app-error";
import { DomainLogger } from "../../../../src/core/logger/domain-logger";

describe("UploadMediaUseCase", () => {
  const makeSut = () => {
    const storageMock = {
      save: jest.fn(async ({ filename, mimeType, buffer, folder }: any) => ({
        path: `local://${folder ?? ""}/${filename}`,
        url: undefined,
        size: buffer.length,
        mimeType,
      })),
    };

    const loggerMock: DomainLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const sut = new UploadMediaUseCase(storageMock as any, null, loggerMock);

    return { sut, storageMock, loggerMock };
  };

  it("deve salvar mídia (base64 puro) e retornar path + size", async () => {
    const { sut, storageMock } = makeSut();

    const dto = {
      file: {
        base64: Buffer.from("hello").toString("base64"),
        filename: "a.txt",
        mimeType: "text/plain",
      },
      folder: "users/10",
      visibility: "private",
    } as any;

    const result = await sut.execute(dto);

    expect(storageMock.save).toHaveBeenCalledTimes(1);
    expect(storageMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "a.txt",
        mimeType: "text/plain",
        folder: "users/10",
        visibility: "private",
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        filename: "a.txt",
        mimeType: "text/plain",
        path: "local://users/10/a.txt",
        size: 5,
      }),
    );
  });

  it("deve aceitar base64 com dataURL (data:...;base64,)", async () => {
    const { sut, storageMock } = makeSut();

    const rawB64 = Buffer.from("hello").toString("base64");
    const dto = {
      file: {
        base64: `data:text/plain;base64,${rawB64}`,
        filename: "a.txt",
        mimeType: "text/plain",
      },
    } as any;

    const result = await sut.execute(dto);

    expect(storageMock.save).toHaveBeenCalledTimes(1);
    expect(result.size).toBe(5);
  });

  it("deve lançar AppError MEDIA_EMPTY quando não houver file", async () => {
    const { sut } = makeSut();

    const responseError = new AppError({
      code: "MEDIA_EMPTY",
      message: "Nenhum arquivo enviado",
      statusCode: 400,
    });
    await expect(sut.execute({} as any)).rejects.toMatchObject<AppError>(responseError);
  });

  it("deve lançar AppError MEDIA_INVALID_BASE64 quando buffer for vazio", async () => {
    const { sut } = makeSut();

    const dto = {
      file: {
        base64: "", // vira buffer vazio
        filename: "a.txt",
        mimeType: "text/plain",
      },
    } as any;

    const responseError = new AppError({
      code: "MEDIA_INVALID_BASE64",
      message: "Arquivo vazio ou base64 inválido",
      statusCode: 400,
    });

    await expect(sut.execute(dto)).rejects.toMatchObject<AppError>(responseError);
  });
});
