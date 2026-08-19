#!/usr/bin/env node
/**
 * Fase 2 — smoke test: conexão mysql2 + CREATE/INSERT/SELECT/DROP em tabela temporária.
 * Uso: configure DB_* (e DB_SSL*) no .env, depois: yarn verify:aurora-db
 */
"use strict";

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config({
  path: [path.resolve(process.cwd(), ".env")],
});

function buildSsl() {
  const enabled = process.env.DB_SSL === "true";
  if (!enabled) return undefined;
  const rejectUnauthorized =
    process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";
  const caPath = process.env.DB_SSL_CA_PATH;
  const ca =
    caPath &&
    fs.readFileSync(
      path.isAbsolute(caPath)
        ? caPath
        : path.resolve(process.cwd(), caPath),
      "utf8",
    );
  return {
    require: true,
    rejectUnauthorized,
    ...(ca ? { ca } : {}),
  };
}

async function main() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE;
  const port = Number(process.env.DB_PORT || 3306);

  if (!host || !user || password === undefined || !database) {
    console.error(
      "Defina DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE no .env",
    );
    process.exit(1);
  }

  const ssl = buildSsl();
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl,
  });

  const table = "_aurora_smoke";
  try {
    await conn.query(
      `CREATE TABLE IF NOT EXISTS \`${table}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payload VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`,
    );

    const tag = `smoke-${Date.now()}`;
    await conn.query(
      `INSERT INTO \`${table}\` (payload) VALUES (?)`,
      [tag],
    );
    const [rows] = await conn.query(
      `SELECT id, payload FROM \`${table}\` WHERE payload = ? LIMIT 1`,
      [tag],
    );

    if (!Array.isArray(rows) || rows.length !== 1 || rows[0].payload !== tag) {
      throw new Error("SELECT não retornou a linha inserida");
    }

    await conn.query(`DROP TABLE IF EXISTS \`${table}\``);
    console.log("OK: conexão, escrita, leitura e limpeza concluídas.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
