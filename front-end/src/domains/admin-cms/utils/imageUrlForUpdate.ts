/**
 * Decide o valor de `imageUrl` a enviar num PATCH/PUT de edição.
 *
 * Se o campo não mudou desde o carregamento do registro, retorna `undefined`
 * para que a imagem não seja reenviada — o cliente HTTP admin só tenta
 * baixar/recodificar `imageUrl` quando ele vem definido, e a imagem já
 * publicada nem sempre pode ser buscada de volta pelo navegador (CORS).
 * O backend, ao não receber `image`, mantém a imagem atual do registro.
 *
 * Se o valor mudou (novo arquivo escolhido ou nova URL colada), repassa o
 * valor atual para seguir o fluxo normal de upload/troca de imagem.
 */
export function imageUrlForUpdate(
  currentValue: string,
  originalValue: string,
): string | undefined {
  const trimmedCurrent = currentValue.trim();
  const trimmedOriginal = originalValue.trim();

  if (trimmedCurrent === trimmedOriginal) {
    return undefined;
  }

  return trimmedCurrent || undefined;
}
