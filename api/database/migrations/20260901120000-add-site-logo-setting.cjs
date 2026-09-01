"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [[existing]] = await queryInterface.sequelize.query(
      "SELECT id FROM `site-settings` WHERE `key` = 'site_logo'",
    );
    if (existing) return;

    await queryInterface.bulkInsert("site-settings", [
      {
        key: "site_logo",
        // Mesma logo já usada hoje pelo front-end (arquivo estático em
        // public/celeiro_ms_logo.jpg); o admin pode substituí-la depois pela
        // tela de Configurações, o que passa a gravar uma URL de upload aqui.
        value: JSON.stringify({ url: "/celeiro_ms_logo.jpg" }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("site-settings", { key: "site_logo" });
  },
};
