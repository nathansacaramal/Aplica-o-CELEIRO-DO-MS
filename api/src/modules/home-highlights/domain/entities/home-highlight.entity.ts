export type HomeHighlightType = "event" | "tourist-point" | "custom";

export interface HomeHighlightProps {
  id: number;
  type: HomeHighlightType;
  referenceId: number;
  title: string;
  description: string;
  cityName: string;
  imageUrl: string;
  ctaUrl: string;
  active: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export class HomeHighlightEntity {
  constructor(private readonly props: HomeHighlightProps) {}
  get id() {
    return this.props.id;
  }

  get type() {
    return this.props.type;
  }

  get referenceId() {
    return this.props.referenceId;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get cityName() {
    return this.props.cityName;
  }

  get imageUrl() {
    return this.props.imageUrl;
  }

  get ctaUrl() {
    return this.props.ctaUrl;
  }

  get active() {
    return this.props.active;
  }

  get order() {
    return this.props.order;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
