export type HomeHighlightType = "event" | "tourist-point" | "custom";

export interface IHomeHighlightBase {
  type: HomeHighlightType;
  referenceId?: string;
  title: string;
  description: string;
  cityName?: string;
  imageUrl?: string;
  ctaUrl?: string;
  active: boolean;
  order: number;
}

export interface IHomeHighlight extends IHomeHighlightBase {
  id: number;
}

export type ICreateHomeHighlightInput = Omit<IHomeHighlight, "id">;

export type IUpdateHomeHighlightInput = Partial<ICreateHomeHighlightInput> &
  Pick<IHomeHighlight, "id">;
