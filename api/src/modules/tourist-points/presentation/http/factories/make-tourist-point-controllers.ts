import { Controller } from "@/core/protocols";
import {
  makeCreateTouristPointUseCase,
  makeDeleteTouristPointUseCase,
  makeGetTouristPointByIdUseCase,
  makeListTouristPointsUseCase,
  makeUpdateTouristPointUseCase,
} from "./make-tourist-point-usecases";

import { CreateTouristPointController } from "../controllers/create-tourist-point.controller";
import { DeleteTouristPointController } from "../controllers/delete-tourist-point.controller";
import { GetTouristPointByIdController } from "../controllers/get-tourist-point-by-id.controller";
import { ListTouristPointsController } from "../controllers/list-tourist-point.controller";
import { UpdateTouristPointController } from "../controllers/update-tourist-point.controller";

export function makeCreateTouristPointController(): Controller {
  return new CreateTouristPointController(makeCreateTouristPointUseCase());
}

export function makeListTouristPointsController(
  audience: "admin" | "public" = "admin",
): Controller {
  return new ListTouristPointsController(makeListTouristPointsUseCase(), audience);
}

export function makeGetTouristPointByIdController(
  audience: "admin" | "public" = "admin",
): Controller {
  return new GetTouristPointByIdController(makeGetTouristPointByIdUseCase(), audience);
}

export function makeUpdateTouristPointController(): Controller {
  return new UpdateTouristPointController(makeUpdateTouristPointUseCase());
}

export function makeDeleteTouristPointController(): Controller {
  return new DeleteTouristPointController(makeDeleteTouristPointUseCase());
}
