// src/modules/blog/domain/value-objects/blog-post-status.ts
export const BLOG_POST_STATUSES = ["draft", "published"] as const;

export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];

export function isBlogPostStatus(value: unknown): value is BlogPostStatus {
  return typeof value === "string" && (BLOG_POST_STATUSES as readonly string[]).includes(value);
}
