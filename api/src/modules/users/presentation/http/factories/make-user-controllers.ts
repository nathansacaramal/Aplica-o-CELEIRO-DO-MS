import { BcryptAdapter } from "@/core/adapters/bcrypt-adapter";
import { Controller } from "@/core/protocols";
import { CreateUserUseCase } from "@/modules/users/application/use-cases/create-user.usecase";
import { DeleteUserUseCase } from "@/modules/users/application/use-cases/delete-user.usecase";
import { GetUserByIdUseCase } from "@/modules/users/application/use-cases/get-user-by-id.usecase";
import { ListUsersUseCase } from "@/modules/users/application/use-cases/list-users.usecase";
import { UpdateUserUseCase } from "@/modules/users/application/use-cases/update-user.usecase";
import { SequelizeUserRepository } from "@/modules/users/infra/sequelize/sequelize-user.repository";
import { CreateUserController } from "../controllers/create-user.controller";
import { DeleteUserController } from "../controllers/delete-user.controller";
import { GetUserByIdController } from "../controllers/get-user-by-id.controller";
import { ListUsersController } from "../controllers/list-users.controller";
import { UpdateUserController } from "../controllers/update-user.controller";

const userRepo = new SequelizeUserRepository();
const encrypter = new BcryptAdapter(12);

const createUserUseCase = new CreateUserUseCase(userRepo, userRepo, encrypter);
const listUsersUseCase = new ListUsersUseCase(userRepo);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepo);
const updateUserUseCase = new UpdateUserUseCase(userRepo, userRepo, encrypter);
const deleteUserUseCase = new DeleteUserUseCase(userRepo, userRepo);

export function makeCreateUserController(): Controller {
  return new CreateUserController(createUserUseCase);
}

export function makeListUsersController(): Controller {
  return new ListUsersController(listUsersUseCase);
}

export function makeGetUserByIdController(): Controller {
  return new GetUserByIdController(getUserByIdUseCase);
}

export function makeUpdateUserController(): Controller {
  return new UpdateUserController(updateUserUseCase);
}

export function makeDeleteUserController(): Controller {
  return new DeleteUserController(deleteUserUseCase);
}
