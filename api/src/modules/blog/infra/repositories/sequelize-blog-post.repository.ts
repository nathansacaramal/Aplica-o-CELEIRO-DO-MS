// src/modules/blog/infra/repositories/sequelize-blog-post.repository.ts
import { Transaction } from "sequelize";
import BlogPostModel from "../model/blog-post-model";
import { BlogPostEntity } from "../../domain/entities/blog-post.entity";
import { CreateBlogPostRepository } from "../../domain/repositories/create-blog-post.repository";
import { DeleteBlogPostRepository } from "../../domain/repositories/delete-blog-post.repository";
import { FindBlogPostByIdRepository } from "../../domain/repositories/find-blog-post-by-id.repository";
import { FindBlogPostBySlugRepository } from "../../domain/repositories/find-blog-post-by-slug.repository";
import { FindBlogPostBySlugAnyStatusRepository } from "../../domain/repositories/find-blog-post-by-slug-any-status.repository";
import {
  ListBlogPostsRepository,
  ListBlogPostsQuery,
  PaginatedResult,
} from "../../domain/repositories/list-blog-posts.repository";
import { ListLatestPublishedBlogPostsRepository } from "../../domain/repositories/list-latest-published-blog-posts.repository";
import { UpdateBlogPostRepository } from "../../domain/repositories/update-blog-post.repository";

import { SpecificationBuilder } from "@/core/domain/specification/specification-builder";
import { eq, like } from "@/core/domain/specification/builders";
import { blogPostModelToEntity } from "../mappers/blog-post-model.mapper";

const ALLOWED_SORT_FIELDS = new Set([
  "id",
  "titulo",
  "slug",
  "status",
  "dataPublicacao",
  "createdAt",
  "updatedAt",
]);

export class SequelizeBlogPostRepository
  implements
    CreateBlogPostRepository,
    FindBlogPostByIdRepository,
    FindBlogPostBySlugRepository,
    FindBlogPostBySlugAnyStatusRepository,
    ListBlogPostsRepository,
    ListLatestPublishedBlogPostsRepository,
    UpdateBlogPostRepository,
    DeleteBlogPostRepository
{
  async create(post: BlogPostEntity, t?: Transaction): Promise<BlogPostEntity> {
    const created = await BlogPostModel.create(
      {
        titulo: post.titulo,
        slug: post.slug,
        resumo: post.resumo,
        conteudo: post.conteudo,
        imagemDestaque: post.imagemDestaque,
        galeria: post.galeria,
        status: post.status,
        dataPublicacao: post.dataPublicacao,
      },
      { transaction: t },
    );

    return blogPostModelToEntity(created);
  }

  async findById(id: number): Promise<BlogPostEntity | null> {
    const found = await BlogPostModel.findByPk(id);
    return found ? blogPostModelToEntity(found) : null;
  }

  async publicFindBySlug(slug: string): Promise<BlogPostEntity | null> {
    const found = await BlogPostModel.findOne({ where: { slug, status: "published" } });
    return found ? blogPostModelToEntity(found) : null;
  }

  async findBySlugAnyStatus(slug: string): Promise<BlogPostEntity | null> {
    const found = await BlogPostModel.findOne({ where: { slug } });
    return found ? blogPostModelToEntity(found) : null;
  }

  async update(
    id: number,
    data: Partial<BlogPostEntity["props"]>,
    t?: Transaction,
  ): Promise<BlogPostEntity | null> {
    const found = await BlogPostModel.findByPk(id);
    if (!found) return null;

    await found.update(
      {
        titulo: data.titulo ?? found.titulo,
        slug: data.slug ?? found.slug,
        resumo: data.resumo ?? found.resumo,
        conteudo: data.conteudo ?? found.conteudo,
        imagemDestaque: data.imagemDestaque ?? found.imagemDestaque,
        galeria: data.galeria ?? found.galeria,
        status: data.status ?? found.status,
        dataPublicacao: data.dataPublicacao ?? found.dataPublicacao,
      },
      { transaction: t },
    );

    return blogPostModelToEntity(found);
  }

  async delete(id: number, t?: Transaction): Promise<boolean> {
    const deleted = await BlogPostModel.destroy({ where: { id }, transaction: t });
    return deleted > 0;
  }

  async list(query: ListBlogPostsQuery): Promise<PaginatedResult<BlogPostEntity>> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const offset = (page - 1) * limit;

    const sortByRaw = query.sort?.by;
    const sortDirRaw = query.sort?.dir;

    const sortBy = ALLOWED_SORT_FIELDS.has(String(sortByRaw)) ? String(sortByRaw) : "dataPublicacao";

    const sortDir = (String(sortDirRaw ?? "desc").toLowerCase() === "asc" ? "asc" : "desc") as
      | "asc"
      | "desc";

    const filters = query.filters ?? {};

    const builder = new SpecificationBuilder<typeof filters>()
      .add((p) => (p.titulo ? like("titulo", p.titulo) : null))
      .add((p) => (!p.onlyPublished && p.status ? eq("status", p.status) : null))
      .add((p) => (p.onlyPublished ? eq("status", "published") : null));

    const spec = builder.build(filters);

    const where = spec ? spec.toSequelizeWhere() : {};

    const { rows, count } = await BlogPostModel.findAndCountAll({
      where,
      order: [[sortBy, sortDir]],
      limit,
      offset,
    });

    const total = typeof count === "number" ? count : 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items: rows.map((r) => blogPostModelToEntity(r)),
      page,
      limit,
      total,
      totalPages,
      sort: { by: sortBy, dir: sortDir },
    };
  }

  async listLatestPublished(limit: number): Promise<BlogPostEntity[]> {
    const rows = await BlogPostModel.findAll({
      where: { status: "published" },
      order: [["dataPublicacao", "desc"]],
      limit,
    });
    return rows.map((r) => blogPostModelToEntity(r));
  }
}
