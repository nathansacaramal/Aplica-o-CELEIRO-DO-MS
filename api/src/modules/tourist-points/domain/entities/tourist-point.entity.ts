import { TouristPointCategory } from "../value-objects/tourist-point-category";

export interface TouristPointProps {
  id?: number;
  cityId: number;
  citySlug: string;
  name: string;
  description: string;
  category: TouristPointCategory;
  address: string;
  openingHours: string;
  imageUrl: string;
  featured: boolean;
  published: boolean;
}

export class TouristPointEntity {
  private props: TouristPointProps;
  constructor(props: TouristPointProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get cityId() {
    return this.props.cityId;
  }

  get citySlug() {
    return this.props.citySlug;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get category() {
    return this.props.category;
  }

  get address() {
    return this.props.address;
  }

  get openingHours() {
    return this.props.openingHours;
  }

  get imageUrl() {
    return this.props.imageUrl;
  }

  get featured() {
    return this.props.featured;
  }

  get published() {
    return this.props.published;
  }

  toJSON() {
    return {
      id: this.props.id,
      cityId: this.props.cityId,
      citySlug: this.props.citySlug,
      name: this.props.name,
      description: this.props.description,
      category: this.props.category,
      address: this.props.address,
      openingHours: this.props.openingHours,
      imageUrl: this.props.imageUrl,
      featured: this.props.featured,
      published: this.props.published,
    };
  }
}
