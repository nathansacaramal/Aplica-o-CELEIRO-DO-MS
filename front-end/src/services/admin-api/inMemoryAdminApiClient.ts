import type {
  ICreateInstitutionalContentInput,
  IInstitutionalContent,
  IUpdateInstitutionalContentInput,
} from "@/entities/institutional/institutional.types";
import type {
  ICreateSocialLinkInput,
  ISocialLink,
  IUpdateSocialLinkInput,
} from "@/entities/social-link/socialLink.types";
import type {
  IAdminApiClient,
  IAdminBlogPostsListQuery,
  IAdminListPickQuery,
} from "./adminApi.types";
import {
  adminMockDelay,
  getInstitutionalContentMock,
  isInstitutionalRecordPresent,
  getSocialLinksMock,
  setInstitutionalContentMock,
  setInstitutionalRecordPresent,
  setSocialLinksMock,
  getCitiesMock,
  setCitiesMock,
  getEventsMock,
  setEventsMock,
  setTouristPointsMock,
  getTouristPointsMock,
  getHomeHighlightsMock,
  setHomeHighlightsMock,
  getSiteSettingsMock,
  setSiteSettingsMock,
  getBlogPostsMock,
  setBlogPostsMock,
} from "@/services/in-memory/mock-data";
import type { ISiteSetting } from "@/entities/settings/settings.types";
import type {
  IBlogPost,
  ICreateBlogPostInput,
  IUpdateBlogPostInput,
} from "@/entities/blog-post/blogPost.types";
import { slugify } from "@/domains/admin-cms/utils/slugify";

import type {
  ICity,
  ICreateCityInput,
  IUpdateCityInput,
} from "@/entities/city/city.types";

import type {
  ICreateEventInput,
  IEvent,
  IUpdateEventInput,
} from "@/entities/event/event.types";

import type {
  ICreateTouristPointInput,
  ITouristPoint,
  IUpdateTouristPointInput,
} from "@/entities/tourist-point/touristPoint.types";

import type {
  ICreateHomeHighlightInput,
  IHomeHighlight,
  IUpdateHomeHighlightInput,
} from "@/entities/home-content/homeContent.types";

function extractExcerptPreview(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
  return text.length <= 220 ? text : `${text.slice(0, 220).trimEnd()}…`;
}

function generateUniqueBlogSlugMock(titulo: string, items: IBlogPost[]): string {
  const base = slugify(titulo) || "publicacao";
  const taken = new Set(items.map((item) => item.slug));
  let candidate = base;
  let counter = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

function filterBlogPostsMock(items: IBlogPost[], query?: IAdminBlogPostsListQuery): IBlogPost[] {
  let out: IBlogPost[] = [...items].sort((a, b) => {
    const ta = new Date(a.dataPublicacao ?? a.createdAt).getTime();
    const tb = new Date(b.dataPublicacao ?? b.createdAt).getTime();
    return tb - ta;
  });
  if (query?.status) {
    out = out.filter((item) => item.status === query.status);
  }
  if (query?.titulo?.trim()) {
    const s = query.titulo.trim().toLowerCase();
    out = out.filter((item) => item.titulo.toLowerCase().includes(s));
  }
  return out;
}

function filterEventsForPick(
  items: IEvent[],
  query?: IAdminListPickQuery,
): IEvent[] {
  let out: IEvent[] = [...items];
  if (query?.search?.trim()) {
    const s: string = query.search.trim().toLowerCase();
    out = out.filter((e: IEvent) => e.name.toLowerCase().includes(s));
  }
  if (query?.category?.trim()) {
    const c: string = query.category.trim().toLowerCase();
    out = out.filter((e: IEvent) =>
      (e.category ?? "").toLowerCase().includes(c),
    );
  }
  const limit: number = query?.limit ?? 30;
  const page: number = query?.page ?? 1;
  const start: number = (page - 1) * limit;
  return out.slice(start, start + limit);
}

function filterTouristPointsForPick(
  items: ITouristPoint[],
  query?: IAdminListPickQuery,
): ITouristPoint[] {
  let out: ITouristPoint[] = [...items];
  if (query?.search?.trim()) {
    const s: string = query.search.trim().toLowerCase();
    out = out.filter((p: ITouristPoint) => p.name.toLowerCase().includes(s));
  }
  if (query?.category?.trim()) {
    const c: string = query.category.trim().toLowerCase();
    out = out.filter((p: ITouristPoint) =>
      (p.category ?? "").toLowerCase().includes(c),
    );
  }
  const limit: number = query?.limit ?? 30;
  const page: number = query?.page ?? 1;
  const start: number = (page - 1) * limit;
  return out.slice(start, start + limit);
}

export function createInMemoryAdminApiClient(): IAdminApiClient {
  return {
    async getInstitutionalContent(): Promise<IInstitutionalContent | null> {
      await adminMockDelay();
      if (!isInstitutionalRecordPresent()) {
        return null;
      }
      return getInstitutionalContentMock();
    },

    async createInstitutionalContent(
      input: ICreateInstitutionalContentInput,
    ): Promise<IInstitutionalContent> {
      await adminMockDelay();

      const nextValue: IInstitutionalContent = {
        id: 1,
        updatedAt: new Date().toISOString(),
        ...input,
      };

      setInstitutionalContentMock(nextValue);
      setInstitutionalRecordPresent(true);

      return nextValue;
    },

    async updateInstitutionalContent(
      input: IUpdateInstitutionalContentInput,
    ): Promise<IInstitutionalContent> {
      await adminMockDelay();

      if (!isInstitutionalRecordPresent()) {
        throw new Error(
          "Nenhum conteúdo institucional na listagem. Recarregue a página ou cadastre o registro.",
        );
      }

      const listed: IInstitutionalContent = getInstitutionalContentMock();
      const patchId: number = listed.id === input.id ? input.id : listed.id;

      const nextValue: IInstitutionalContent = {
        ...listed,
        ...input,
        id: patchId,
        updatedAt: new Date().toISOString(),
      };

      setInstitutionalContentMock(nextValue);

      return nextValue;
    },

    async listSocialLinks(): Promise<ISocialLink[]> {
      await adminMockDelay();
      return getSocialLinksMock();
    },

    async createSocialLink(
      input: ICreateSocialLinkInput,
    ): Promise<ISocialLink> {
      await adminMockDelay();

      const currentItems: ISocialLink[] = getSocialLinksMock();

      const nextItem: ISocialLink = {
        id: Math.random(),
        ...input,
      };

      setSocialLinksMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateSocialLink(
      input: IUpdateSocialLinkInput,
    ): Promise<ISocialLink> {
      await adminMockDelay();

      const currentItems: ISocialLink[] = getSocialLinksMock();
      const currentItem: ISocialLink | undefined = currentItems.find(
        (item: ISocialLink) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Link social não encontrado.");
      }

      const nextItem: ISocialLink = {
        ...currentItem,
        ...input,
      };

      const nextItems: ISocialLink[] = currentItems.map((item: ISocialLink) =>
        item.id === input.id ? nextItem : item,
      );

      setSocialLinksMock(nextItems);

      return nextItem;
    },

    async deleteSocialLink(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: ISocialLink[] = getSocialLinksMock();
      const nextItems: ISocialLink[] = currentItems.filter(
        (item: ISocialLink) => item.id !== id,
      );

      setSocialLinksMock(nextItems);
    },

    async listCities(): Promise<ICity[]> {
      await adminMockDelay();
      return getCitiesMock();
    },

    async getCityById(id: number): Promise<ICity | null> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const foundItem: ICity | undefined = currentItems.find(
        (item: ICity) => item.id === id,
      );

      return foundItem ?? null;
    },

    async getCityBySlug(slug: string): Promise<ICity | null> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const foundItem: ICity | undefined = currentItems.find(
        (item: ICity) => item.slug === slug,
      );

      return foundItem ?? null;
    },

    async createCity(input: ICreateCityInput): Promise<ICity> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();

      const nextItem: ICity = {
        id: Math.random(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCitiesMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateCity(input: IUpdateCityInput): Promise<ICity> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const currentItem: ICity | undefined = currentItems.find(
        (item: ICity) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Cidade não encontrada.");
      }

      const nextItem: ICity = {
        ...currentItem,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const nextItems: ICity[] = currentItems.map((item: ICity) =>
        item.id === input.id ? nextItem : item,
      );

      setCitiesMock(nextItems);

      return nextItem;
    },

    async deleteCity(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const nextItems: ICity[] = currentItems.filter(
        (item: ICity) => item.id !== id,
      );

      setCitiesMock(nextItems);
    },

    async listEvents(): Promise<IEvent[]> {
      await adminMockDelay();
      return getEventsMock();
    },

    async listEventsForPick(query?: IAdminListPickQuery): Promise<IEvent[]> {
      await adminMockDelay();
      return filterEventsForPick(getEventsMock(), query);
    },

    async getEventById(id: number): Promise<IEvent | null> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();
      const foundItem: IEvent | undefined = currentItems.find(
        (item: IEvent) => item.id === id,
      );

      return foundItem ?? null;
    },

    async createEvent(input: ICreateEventInput): Promise<IEvent> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();

      const nextItem: IEvent = {
        id: Math.random(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEventsMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateEvent(input: IUpdateEventInput): Promise<IEvent> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();
      const currentItem: IEvent | undefined = currentItems.find(
        (item: IEvent) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Evento não encontrado.");
      }

      const nextItem: IEvent = {
        ...currentItem,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const nextItems: IEvent[] = currentItems.map((item: IEvent) =>
        item.id === input.id ? nextItem : item,
      );

      setEventsMock(nextItems);

      return nextItem;
    },

    async deleteEvent(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();
      const nextItems: IEvent[] = currentItems.filter(
        (item: IEvent) => item.id !== id,
      );

      setEventsMock(nextItems);
    },

    async listBlogPosts(query?: IAdminBlogPostsListQuery): Promise<IBlogPost[]> {
      await adminMockDelay();
      return filterBlogPostsMock(getBlogPostsMock(), query);
    },

    async getBlogPostById(id: number): Promise<IBlogPost | null> {
      await adminMockDelay();
      const found = getBlogPostsMock().find((item) => item.id === id);
      return found ?? null;
    },

    async createBlogPost(input: ICreateBlogPostInput): Promise<IBlogPost> {
      await adminMockDelay();

      const currentItems: IBlogPost[] = getBlogPostsMock();
      const slug = generateUniqueBlogSlugMock(input.titulo, currentItems);
      const resumo = extractExcerptPreview(input.conteudo);
      const now = new Date().toISOString();

      const nextItem: IBlogPost = {
        id: Math.random(),
        titulo: input.titulo,
        slug,
        resumo,
        conteudo: input.conteudo,
        imagemDestaque: input.imagemDestacadaUrl.trim(),
        status: input.status,
        dataPublicacao: input.dataPublicacao ?? now,
        createdAt: now,
        updatedAt: now,
      };

      setBlogPostsMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateBlogPost(input: IUpdateBlogPostInput): Promise<IBlogPost> {
      await adminMockDelay();

      const currentItems: IBlogPost[] = getBlogPostsMock();
      const currentItem: IBlogPost | undefined = currentItems.find(
        (item) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Publicação não encontrada.");
      }

      const conteudo = input.conteudo ?? currentItem.conteudo;
      const willPublishNow =
        input.status === "published" &&
        currentItem.status !== "published" &&
        input.dataPublicacao === undefined;

      const nextItem: IBlogPost = {
        ...currentItem,
        titulo: input.titulo ?? currentItem.titulo,
        conteudo,
        resumo: input.conteudo !== undefined ? extractExcerptPreview(conteudo) : currentItem.resumo,
        status: input.status ?? currentItem.status,
        dataPublicacao: willPublishNow
          ? new Date().toISOString()
          : (input.dataPublicacao ?? currentItem.dataPublicacao),
        imagemDestaque:
          input.imagemDestacadaUrl?.trim() ? input.imagemDestacadaUrl.trim() : currentItem.imagemDestaque,
        updatedAt: new Date().toISOString(),
      };

      const nextItems: IBlogPost[] = currentItems.map((item) =>
        item.id === input.id ? nextItem : item,
      );

      setBlogPostsMock(nextItems);

      return nextItem;
    },

    async deleteBlogPost(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: IBlogPost[] = getBlogPostsMock();
      const nextItems: IBlogPost[] = currentItems.filter((item) => item.id !== id);

      setBlogPostsMock(nextItems);
    },

    async listTouristPoints(): Promise<ITouristPoint[]> {
      await adminMockDelay();
      return getTouristPointsMock();
    },

    async listTouristPointsForPick(
      query?: IAdminListPickQuery,
    ): Promise<ITouristPoint[]> {
      await adminMockDelay();
      return filterTouristPointsForPick(getTouristPointsMock(), query);
    },

    async getTouristPointById(id: number): Promise<ITouristPoint | null> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();
      const foundItem: ITouristPoint | undefined = currentItems.find(
        (item: ITouristPoint) => item.id === id,
      );

      return foundItem ?? null;
    },

    async createTouristPoint(
      input: ICreateTouristPointInput,
    ): Promise<ITouristPoint> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();

      const nextItem: ITouristPoint = {
        id: Math.random(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTouristPointsMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateTouristPoint(
      input: IUpdateTouristPointInput,
    ): Promise<ITouristPoint> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();
      const currentItem: ITouristPoint | undefined = currentItems.find(
        (item: ITouristPoint) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Ponto turístico não encontrado.");
      }

      const nextItem: ITouristPoint = {
        ...currentItem,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const nextItems: ITouristPoint[] = currentItems.map(
        (item: ITouristPoint) => (item.id === input.id ? nextItem : item),
      );

      setTouristPointsMock(nextItems);

      return nextItem;
    },

    async deleteTouristPoint(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();
      const nextItems: ITouristPoint[] = currentItems.filter(
        (item: ITouristPoint) => item.id !== id,
      );

      setTouristPointsMock(nextItems);
    },

    async listHomeHighlights(): Promise<IHomeHighlight[]> {
      await adminMockDelay();
      return getHomeHighlightsMock();
    },

    async createHomeHighlight(
      input: ICreateHomeHighlightInput,
    ): Promise<IHomeHighlight> {
      await adminMockDelay();

      const currentItems: IHomeHighlight[] = getHomeHighlightsMock();

      const nextItem: IHomeHighlight = {
        id: Math.random(),
        ...input,
      };

      setHomeHighlightsMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateHomeHighlight(
      input: IUpdateHomeHighlightInput,
    ): Promise<IHomeHighlight> {
      await adminMockDelay();

      const currentItems: IHomeHighlight[] = getHomeHighlightsMock();
      const currentItem: IHomeHighlight | undefined = currentItems.find(
        (item: IHomeHighlight) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Destaque não encontrado.");
      }

      const nextItem: IHomeHighlight = {
        ...currentItem,
        ...input,
      };

      setHomeHighlightsMock(
        currentItems.map((item: IHomeHighlight) =>
          item.id === input.id ? nextItem : item,
        ),
      );

      return nextItem;
    },

    async deleteHomeHighlight(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: IHomeHighlight[] = getHomeHighlightsMock();
      setHomeHighlightsMock(
        currentItems.filter((item: IHomeHighlight) => item.id !== id),
      );
    },

    async getSettings(): Promise<ISiteSetting[]> {
      await adminMockDelay();
      return getSiteSettingsMock();
    },

    async updateSetting(key: string, value: unknown): Promise<ISiteSetting> {
      await adminMockDelay();

      const currentItems: ISiteSetting[] = getSiteSettingsMock();
      const currentItem: ISiteSetting | undefined = currentItems.find(
        (item: ISiteSetting) => item.key === key,
      );

      const nextItem: ISiteSetting = currentItem
        ? { ...currentItem, value, updatedAt: new Date().toISOString() }
        : {
            id: currentItems.length + 1,
            key,
            value,
            updatedAt: new Date().toISOString(),
          };

      const nextItems: ISiteSetting[] = currentItem
        ? currentItems.map((item: ISiteSetting) =>
            item.key === key ? nextItem : item,
          )
        : [...currentItems, nextItem];

      setSiteSettingsMock(nextItems);

      return nextItem;
    },

    async updateSiteLogo(imageUrlFieldValue: string): Promise<ISiteSetting> {
      await adminMockDelay();

      const currentItems: ISiteSetting[] = getSiteSettingsMock();
      const currentItem: ISiteSetting | undefined = currentItems.find(
        (item: ISiteSetting) => item.key === "site_logo",
      );
      const value = { url: imageUrlFieldValue.trim() };

      const nextItem: ISiteSetting = currentItem
        ? { ...currentItem, value, updatedAt: new Date().toISOString() }
        : {
            id: currentItems.length + 1,
            key: "site_logo",
            value,
            updatedAt: new Date().toISOString(),
          };

      const nextItems: ISiteSetting[] = currentItem
        ? currentItems.map((item: ISiteSetting) =>
            item.key === "site_logo" ? nextItem : item,
          )
        : [...currentItems, nextItem];

      setSiteSettingsMock(nextItems);

      return nextItem;
    },
  };
}
