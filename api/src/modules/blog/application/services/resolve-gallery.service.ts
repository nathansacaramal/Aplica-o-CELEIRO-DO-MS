import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import type { WebImagePayload } from "@/modules/media/domain/value-objects/web-image-payload";

export type GalleryItemInput = { url: string } | { image: WebImagePayload };

const BLOG_GALLERY_FOLDER = "blog";

/**
 * Converte a lista final enviada pelo admin em URLs, preservando a ordem:
 * itens com `url` já estão publicados e passam direto; itens com `image` são
 * enviados ao storage agora.
 *
 * As fotos são enviadas em sequência (e não em paralelo) porque cada upload
 * passa pelo sharp — um lote grande em paralelo competiria por CPU e memória
 * do mesmo processo que atende as demais requisições.
 */
export async function resolveGallery(
  items: GalleryItemInput[],
  images: PublicWebImageUploader,
): Promise<string[]> {
  const urls: string[] = [];

  for (const item of items) {
    if ("url" in item) {
      urls.push(item.url);
      continue;
    }

    const { url } = await images.uploadPublicWebImage(item.image, BLOG_GALLERY_FOLDER);
    urls.push(url);
  }

  return urls;
}
