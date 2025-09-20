export interface SearchResult<T> {
  items: T[];
  count: number;
  totalPages: number;
}
