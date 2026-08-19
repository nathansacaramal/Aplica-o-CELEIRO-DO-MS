export interface InstitutionalContentProps {
  id: number;
  aboutTitle: string;
  aboutText: string;
  whoWeAreTitle: string;
  whoWeAreText: string;
  purposeTitle: string;
  purposeText: string;
  mission: string;
  vision: string;
  valuesJson: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InstitutionalContentEntity {
  constructor(private readonly props: InstitutionalContentProps) {}
  get id() {
    return this.props.id;
  }
  get aboutTitle() {
    return this.props.aboutTitle;
  }
  get aboutText() {
    return this.props.aboutText;
  }
  get whoWeAreTitle() {
    return this.props.whoWeAreTitle;
  }
  get whoWeAreText() {
    return this.props.whoWeAreText;
  }
  get purposeTitle() {
    return this.props.purposeTitle;
  }
  get purposeText() {
    return this.props.purposeText;
  }
  get mission() {
    return this.props.mission;
  }
  get vision() {
    return this.props.vision;
  }
  get valuesJson() {
    return this.props.valuesJson;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
