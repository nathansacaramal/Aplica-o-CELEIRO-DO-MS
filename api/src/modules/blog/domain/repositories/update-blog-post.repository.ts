import { Transaction } from "sequelize";
import { BlogPostEntity } from "../entities/blog-post.entity";

export interface UpdateBlogPostRepository {
  update(
    id: number,
    data: Partial<BlogPostEntity["props"]>,
    t?: Transaction,
  ): Promise<BlogPostEntity | null>;
}
