export interface CityProps {
  id?: number;
  name: string;
  state: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string;
  published: boolean;
}

export class CityEntity {
  private props: CityProps;

  constructor(props: CityProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get state() {
    return this.props.state;
  }

  get slug() {
    return this.props.slug;
  }

  get summary() {
    return this.props.summary;
  }

  get description() {
    return this.props.description;
  }

  get imageUrl() {
    return this.props.imageUrl;
  }

  get published() {
    return this.props.published;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      state: this.state,
      summary: this.summary,
      description: this.description,
      imageUrl: this.imageUrl,
      published: this.published,
    };
  }
}
