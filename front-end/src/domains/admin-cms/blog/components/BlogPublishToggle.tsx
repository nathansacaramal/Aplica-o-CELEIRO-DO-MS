import type { ReactElement } from "react";
import { cn } from "@/design-system/utils/cn";
import type { BlogPostStatus } from "@/entities/blog-post/blogPost.types";

interface IBlogPublishToggleProps {
  status: BlogPostStatus;
  disabled?: boolean;
  onToggle: (nextStatus: BlogPostStatus) => void;
}

export function BlogPublishToggle({
  status,
  disabled = false,
  onToggle,
}: IBlogPublishToggleProps): ReactElement {
  const isPublished = status === "published";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublished}
      aria-label={isPublished ? "Despublicar" : "Publicar"}
      disabled={disabled}
      onClick={() => onToggle(isPublished ? "draft" : "published")}
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        isPublished ? "bg-emerald-500" : "bg-zinc-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          isPublished ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
