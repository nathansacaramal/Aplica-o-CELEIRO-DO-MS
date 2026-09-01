import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";
import { LatestBlogPostsSection } from "@/domains/catalogo-publico/blog/components/LatestBlogPostsSection";
import type { ReactElement } from "react";
import { HomeHeroCarousel } from "../components/HomeHeroCarousel";
import { CeleiroIntroSection } from "../components/CeleiroIntroSection";
import { CitiesGridSection } from "../components/CitiesGridSection";

export function HomePage(): ReactElement {
  usePublicPageMetadata({
    title: "Celeiro do MS — eventos e turismo",
    description:
      "Descubra eventos, pontos turísticos e experiências do Mato Grosso do Sul.",
    canonicalPath: "/",
  });

  return (
    <div className="bg-portal">
      <HomeHeroCarousel />
      <LatestBlogPostsSection />
      <CeleiroIntroSection />
      <CitiesGridSection />
    </div>
  );
}
