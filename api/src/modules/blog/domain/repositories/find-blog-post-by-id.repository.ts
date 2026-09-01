import { BlogPostEntity } from "../entities/blog-post.entity";

export interface FindBlogPostByIdRepository {
  findById(id: number): Promise<BlogPostEntity | null>;
}
