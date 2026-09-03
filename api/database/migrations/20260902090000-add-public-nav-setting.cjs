"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [[existing]] = await queryInterface.sequelize.query(
      "SELECT id FROM `site-settings` WHERE `key` = 'public_nav'",
    );
    if (existing) return;

    await queryInterface.bulkInsert("site-settings", [
      {
        key: "public_nav",
        // Nada escondido por padrão: o menu público nasce completo.
        value: JSON.stringify({ hidden: [] }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("site-settings", { key: "public_nav" });
  },
};
