"use strict";

const bcrypt = require("bcrypt");
const path = require("path");

/** Raiz do repo (este arquivo está em database/seeders/). */
const PROJECT_ROOT = path.resolve(__dirname, "../..");

require("dotenv").config({
  path: [
    path.join(PROJECT_ROOT, `.env.${process.env.NODE_ENV || "development"}`),
    path.join(PROJECT_ROOT, ".env"),
  ],
});

/** Mesmo valor usado em make-user-controllers e make-auth-controllers */
const BCRYPT_ROUNDS = 12;

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
    if (!adminEmail) {
      throw new Error(
        "ADMIN_EMAIL não definido ou vazio. Defina no .env ou na task ECS antes do seed de admin.",
      );
    }

    const password = (process.env.ADMIN_PASSWORD || "").trim();
    if (!password) {
      throw new Error(
        "ADMIN_PASSWORD não definida ou vazia. Defina no .env ou no Secrets Manager (ECS) antes do seed de admin.",
      );
    }

    const dialect = queryInterface.sequelize.getDialect();
    const usersTable = dialect === "postgres" ? '"Users"' : "`Users`";

    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM ${usersTable} WHERE email = :email LIMIT 1`,
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    if (existing) return;

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const now = new Date();

    await queryInterface.bulkInsert("Users", [
      {
        email: adminEmail,
        password: hash,
        name: "Administrador",
        role: "Admin",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const [row] = await queryInterface.sequelize.query(
      `SELECT id FROM ${usersTable} WHERE email = :email LIMIT 1`,
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    await queryInterface.bulkInsert("admins", [
      {
        userId: row.id,
        name: "Administrador",
        phone: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
    if (!adminEmail) {
      throw new Error(
        "ADMIN_EMAIL é necessário para desfazer o seed (mesmo e-mail usado no up).",
      );
    }

    const dialect = queryInterface.sequelize.getDialect();
    const usersTable = dialect === "postgres" ? '"Users"' : "`Users`";

    const [row] = await queryInterface.sequelize.query(
      `SELECT id FROM ${usersTable} WHERE email = :email LIMIT 1`,
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    if (!row) return;

    await queryInterface.bulkDelete("admins", { userId: row.id });
    await queryInterface.bulkDelete("Users", { email: adminEmail });
  },
};
