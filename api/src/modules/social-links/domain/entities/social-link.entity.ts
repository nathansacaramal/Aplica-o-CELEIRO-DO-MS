export interface SocialLinkProps {
  id: number;
  platform: string;
  label: string;
  url: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SocialLinkEntity {
  constructor(private readonly props: SocialLinkProps) {}

  get id() {
    return this.props.id;
  }
  get platform() {
    return this.props.platform;
  }
  get label() {
    return this.props.label;
  }
  get url() {
    return this.props.url;
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
