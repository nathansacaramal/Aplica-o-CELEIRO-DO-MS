export interface SettingProps {
  id?: number;
  key: string;
  value: unknown;
  updatedAt?: Date;
}

export class SettingEntity {
  private props: SettingProps;

  constructor(props: SettingProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get key() {
    return this.props.key;
  }

  get value() {
    return this.props.value;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      key: this.key,
      value: this.value,
      updatedAt: this.updatedAt,
    };
  }
}
