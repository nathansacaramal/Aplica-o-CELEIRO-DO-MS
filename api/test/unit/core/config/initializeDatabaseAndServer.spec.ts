import { initializeDatabaseAndServer } from "@/core/config/initializeDatabaseAndServer";

it("carrega models dos módulos via glob", async () => {
  const sequelize = { authenticate: jest.fn(), sync: jest.fn() } as any;

  const globMock = jest.fn(async () => [
    "/app/src/modules/users/infra/model/user-model.ts",
    "/app/src/modules/pedidos/infra/model/pedido-model.ts",
  ]);

  await initializeDatabaseAndServer(sequelize, {
    env: { UPDATE_MODEL: true, NODE_ENV: "development" } as any,
    resolveRuntimePath: () => "/app/src/modules",
    glob: globMock as any,
    importer: jest.fn(async () => ({ default: {} })),
    log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any,
  });

  expect(globMock).toHaveBeenCalled();
  expect(sequelize.authenticate).toHaveBeenCalled();
  expect(sequelize.sync).toHaveBeenCalledWith({ alter: true });
});
