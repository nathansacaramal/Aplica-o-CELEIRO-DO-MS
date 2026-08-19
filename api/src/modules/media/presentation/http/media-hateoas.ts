// src/modules/media/presentation/http/media-hateoas.ts
import { Links } from "@/core/http/http-resource";

export function mediaLinks(): Links {
  return {
    self: { href: "/api/media", method: "POST" },
  };
}
