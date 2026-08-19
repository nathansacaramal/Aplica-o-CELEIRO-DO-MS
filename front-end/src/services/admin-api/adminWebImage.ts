/**
 * A API admin exige `image: { base64, mimeType }` (ver catalogo-eventos-api webImageFileSchema).
 * O formulário usa `imageUrl` string: aceitamos data URLs e, no browser, URLs http(s) baixadas
 * via fetch (requer CORS no host da imagem).
 */

export type IWebImagePayload = {
  base64: string;
  mimeType: string;
  filename?: string;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function parseDataUrl(
  trimmed: string,
): { mimeType: string; base64: string } | null {
  const match = trimmed.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match?.[1] || !match[2]) {
    return null;
  }
  return { mimeType: match[1].toLowerCase(), base64: match[2] };
}

/**
 * Converte o campo imagem (data URL ou URL http(s) com CORS) no payload esperado pela API.
 * Lança antes de qualquer request HTTP ao BFF se o valor for inválido.
 */
export async function resolveWebImagePayloadFromImageUrlField(
  imageUrl: string | undefined,
  fieldLabel: string,
): Promise<IWebImagePayload> {
  const trimmed = imageUrl?.trim() ?? "";
  if (!trimmed) {
    throw new Error(`${fieldLabel}: escolha uma imagem antes de salvar.`);
  }

  const dataParsed = parseDataUrl(trimmed);
  if (dataParsed) {
    return {
      mimeType: dataParsed.mimeType,
      base64: dataParsed.base64,
      filename: "upload",
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    let response: Response;
    try {
      response = await fetch(trimmed, { mode: "cors", credentials: "omit" });
    } catch (err: unknown) {
      const isCorsOrNetwork =
        err instanceof TypeError &&
        /fetch|network|failed|load/i.test(String(err.message));
      const hint = isCorsOrNetwork
        ? " Tente enviar o arquivo pelo botão \"Escolher imagem\" em vez de colar o link."
        : "";
      throw new Error(
        `${fieldLabel}: não foi possível carregar essa imagem pelo link informado.${hint}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `${fieldLabel}: não foi possível acessar esse link. Verifique se o endereço está correto ou envie o arquivo direto do computador.`,
      );
    }

    const blob = await response.blob();
    let mimeType = blob.type.split(";")[0]?.trim() ?? "";

    if (!mimeType.startsWith("image/")) {
      if (mimeType === "" || mimeType === "application/octet-stream") {
        mimeType = "image/jpeg";
      } else {
        throw new Error(
          `${fieldLabel}: esse link não aponta para uma imagem válida. Verifique o endereço ou envie o arquivo direto do computador.`,
        );
      }
    }

    const buf = await blob.arrayBuffer();
    return {
      mimeType,
      base64: arrayBufferToBase64(buf),
      filename: "upload",
    };
  }

  throw new Error(
    `${fieldLabel}: envie um arquivo de imagem pelo botão "Escolher imagem" ou cole um link (https://) que aponte direto para uma imagem.`,
  );
}
