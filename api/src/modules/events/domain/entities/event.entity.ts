// src/modules/events/domain/entities/event.entity.ts
import { EventCategory } from "../value-objects/event-category";

export interface EventProps {
  id: number;
  cityId: number;
  citySlug: string;
  name: string;
  description: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  formattedDate: string;
  location: string;
  imageUrl: string;
  featured: boolean;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EventEntity {
  constructor(public readonly props: EventProps) {}

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
  get startDate() {
    return this.props.startDate;
  }
  get endDate() {
    return this.props.endDate;
  }
  get formattedDate() {
    return this.props.formattedDate;
  }
  get location() {
    return this.props.location;
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
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
