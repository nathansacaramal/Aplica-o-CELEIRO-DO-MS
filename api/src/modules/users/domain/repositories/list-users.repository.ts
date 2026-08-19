import { UserEntity } from "../entities/user.entity";

export type ListUsersSortField = "name" | "email" | "createdAt";
export type ListUsersSortDir = "asc" | "desc";

/** Critérios de busca e paginação (camada de domínio / aplicação). */
export interface ListUsersSearchParams {
  page: number;
  limit: number;
  nameContains?: string;
  emailEquals?: string;
  sortBy: ListUsersSortField;
  sortDir: ListUsersSortDir;
}

export interface ListUsersPageResult {
  items: UserEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface ListUsersRepository {
  list(params: ListUsersSearchParams): Promise<ListUsersPageResult>;
}
