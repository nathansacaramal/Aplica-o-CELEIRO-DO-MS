import { FindBlogPostBySlugAnyStatusRepository } from "../../domain/repositories/find-blog-post-by-slug-any-status.repository";
import { slugify } from "./slugify";

/**
 * Gera um slug único a partir do título, sufixando -2, -3... em caso de colisão.
 * Mesmo algoritmo hoje usado só na migration de backfill de slug de eventos/pontos
 * turísticos, promovido aqui a serviço de aplicação porque o Blog gera o slug no
 * servidor (diferente de eventos, onde o slug vem do cliente).
 */
export class GenerateUniqueBlogSlugService {
  constructor(private readonly findBySlugRepo: FindBlogPostBySlugAnyStatusRepository) {}

  async generate(titulo: string): Promise<string> {
    const base = slugify(titulo) || "publicacao";
    let candidate = base;
    let counter = 2;

    while (await this.findBySlugRepo.findBySlugAnyStatus(candidate)) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }

    return candidate;
  }
}
