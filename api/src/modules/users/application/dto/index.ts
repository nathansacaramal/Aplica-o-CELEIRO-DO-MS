import { z } from "zod";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from "@/modules/users/presentation/http/validators/user-schemas";
import type { UserEntity } from "../../domain/entities/user.entity";
import type {
  ListUsersSortDir,
  ListUsersSortField,
} from "../../domain/repositories/list-users.repository";
import { UserRole } from "../../domain/value-objects/user-role";

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// Se você quiser manter compat com nomes antigos:
export type CreateUserDto = CreateUserDTO;
export type UpdateUserDto = UpdateUserDTO;

// Tipo básico de usuário “plain”
export interface UserViewModel {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
}

export type ListUsersQueryDTO = z.infer<typeof listUsersQuerySchema>;

export interface ListUsersResult {
  items: UserEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sort: { by: ListUsersSortField; dir: ListUsersSortDir };
}
