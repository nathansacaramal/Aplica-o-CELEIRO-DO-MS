// src/database.ts
import { ENV } from "@/core/config/env";
import { logger } from "@/core/config/logger";
import fs from "node:fs";
import path from "node:path";
import { Dialect, Options, Sequelize } from "sequelize";

const isTest = ENV.NODE_ENV === "test";

function buildMysqlOptions(): Options {
  const caPath = ENV.DB_SSL_CA_PATH?.trim();
  const useMysql2RdsProfile = ENV.DB_SSL && ENV.DB_DIALECT === "mysql" && !caPath;

  const dialectOptions: Options["dialectOptions"] = ENV.DB_SSL
    ? useMysql2RdsProfile
      ? ENV.DB_SSL_REJECT_UNAUTHORIZED
        ? { ssl: "Amazon RDS" }
        : { ssl: { rejectUnauthorized: false } }
      : {
          ssl: {
            require: true,
            rejectUnauthorized: ENV.DB_SSL_REJECT_UNAUTHORIZED,
            ...(caPath
              ? {
                  ca: fs.readFileSync(
                    path.isAbsolute(caPath) ? caPath : path.resolve(process.cwd(), caPath),
                    "utf8",
                  ),
                }
              : {}),
          },
        }
    : undefined;

  return {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    dialect: ENV.DB_DIALECT as Dialect,
    logging: ENV.NODE_ENV === "development" ? (msg) => logger.database(msg) : false,
    pool: {
      max: ENV.DB_POOL_MAX,
      min: ENV.DB_POOL_MIN,
      acquire: ENV.DB_POOL_ACQUIRE_MS,
      idle: ENV.DB_POOL_IDLE_MS,
    },
    ...(dialectOptions ? { dialectOptions } : {}),
  };
}

const sequelize = isTest
  ? new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    })
  : new Sequelize(ENV.DB_DATABASE, ENV.DB_USERNAME, ENV.DB_PASSWORD, buildMysqlOptions());

logger.info("Sequelize instance created", {
  dialect: isTest ? "sqlite" : ENV.DB_DIALECT,
  host: isTest ? "memory" : ENV.DB_HOST,
  ssl: isTest ? false : ENV.DB_SSL,
});

export default sequelize;
