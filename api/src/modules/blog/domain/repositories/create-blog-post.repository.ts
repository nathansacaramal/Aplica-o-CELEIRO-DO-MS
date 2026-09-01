import { Transaction } from "sequelize";
import { BlogPostEntity } from "../entities/blog-post.entity";

export interface CreateBlogPostRepository {
  create(post: BlogPostEntity, t?: Transaction): Promise<BlogPostEntity>;
}
