export interface DeleteHomeHighlightRepository {
  delete(id: number): Promise<boolean>;
}
