import { resolveGallery } from "@/modules/blog/application/services/resolve-gallery.service";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function makeImages(): PublicWebImageUploader {
  let counter = 0;
  return {
    uploadPublicWebImage: jest.fn().mockImplementation(async () => {
      counter += 1;
      return { url: `https://cdn/nova-${counter}.jpg` };
    }),
    replacePublicWebImage: jest.fn(),
  };
}

describe("resolveGallery", () => {
  it("retorna lista vazia quando não há itens", async () => {
    const images = makeImages();
    expect(await resolveGallery([], images)).toEqual([]);
    expect(images.uploadPublicWebImage).not.toHaveBeenCalled();
  });

  it("mantém URLs já publicadas sem reenviar ao storage", async () => {
    const images = makeImages();

    const out = await resolveGallery(
      [{ url: "https://cdn/antiga-1.jpg" }, { url: "https://cdn/antiga-2.jpg" }],
      images,
    );

    expect(out).toEqual(["https://cdn/antiga-1.jpg", "https://cdn/antiga-2.jpg"]);
    expect(images.uploadPublicWebImage).not.toHaveBeenCalled();
  });

  it("envia imagens novas na pasta blog", async () => {
    const images = makeImages();
    const image = { base64: tinyPngB64, mimeType: "image/png" };

    const out = await resolveGallery([{ image }], images);

    expect(out).toEqual(["https://cdn/nova-1.jpg"]);
    expect(images.uploadPublicWebImage).toHaveBeenCalledWith(image, "blog");
  });

  it("preserva a ordem misturando fotos existentes e novas", async () => {
    const images = makeImages();
    const image = { base64: tinyPngB64, mimeType: "image/png" };

    const out = await resolveGallery(
      [{ url: "https://cdn/antiga.jpg" }, { image }, { url: "https://cdn/outra.jpg" }, { image }],
      images,
    );

    expect(out).toEqual([
      "https://cdn/antiga.jpg",
      "https://cdn/nova-1.jpg",
      "https://cdn/outra.jpg",
      "https://cdn/nova-2.jpg",
    ]);
  });
});
