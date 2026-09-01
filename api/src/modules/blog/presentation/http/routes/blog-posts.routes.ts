import { Router } from "express";
import adaptRoute from "@/core/adapters/express-route-adapter";
import authMiddleware from "@/core/http/middlewares/auth-middleware";
import authorizeRoles from "@/core/http/middlewares/authorize-roles";
import { validateBody } from "@/core/http/middlewares/validate-body";
import { validateQuery } from "@/core/http/middlewares/validate-query";

import { makeListBlogPostsController } from "../factories/make-list-blog-posts.controller";
import { makeCreateBlogPostController } from "../factories/make-create-blog-post.controller";
import { makeUpdateBlogPostController } from "../factories/make-update-blog-post.controller";
import { makeDeleteBlogPostController } from "../factories/make-delete-blog-post.controller";
import { makeGetBlogPostByIdController } from "../factories/make-get-blog-post-by-id.controller";
import { makeFindBlogPostBySlugController } from "../factories/make-find-blog-post-by-slug.controller";
import { makeListLatestPublishedBlogPostsController } from "../factories/make-list-latest-published-blog-posts.controller";

import {
  createBlogPostSchema,
  listBlogPostsQuerySchema,
  listLatestBlogPostsQuerySchema,
  updateBlogPostSchema,
} from "../validators/blog-post-schemas";

export function registerBlogPostRoutes(router: Router) {
  router.get(
    "/admin/blog",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateQuery(listBlogPostsQuerySchema),
    adaptRoute(makeListBlogPostsController("admin")),
  );

  router.get(
    "/admin/blog/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeGetBlogPostByIdController("admin")),
  );

  router.post(
    "/admin/blog",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(createBlogPostSchema),
    adaptRoute(makeCreateBlogPostController()),
  );

  router.patch(
    "/admin/blog/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    validateBody(updateBlogPostSchema),
    adaptRoute(makeUpdateBlogPostController()),
  );

  router.delete(
    "/admin/blog/:id",
    authMiddleware,
    authorizeRoles(["Admin"]),
    adaptRoute(makeDeleteBlogPostController()),
  );

  // Seção "Últimas publicações" da home — precisa vir antes de /public/blog/:slug.
  router.get(
    "/public/blog/latest",
    validateQuery(listLatestBlogPostsQuerySchema),
    adaptRoute(makeListLatestPublishedBlogPostsController()),
  );

  router.get(
    "/public/blog",
    validateQuery(listBlogPostsQuerySchema),
    adaptRoute(makeListBlogPostsController("public")),
  );

  // Rota pública por id fica sob /by-id/ para não colidir com /public/blog/:slug
  // (mesmo padrão usado em eventos/pontos turísticos).
  router.get(
    "/public/blog/by-id/:id",
    adaptRoute(makeGetBlogPostByIdController("public")),
  );

  router.get(
    "/public/blog/:slug",
    adaptRoute(makeFindBlogPostBySlugController()),
  );
}
