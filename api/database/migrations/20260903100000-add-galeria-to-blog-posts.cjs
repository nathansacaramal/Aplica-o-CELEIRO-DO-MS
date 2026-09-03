"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("blog-posts");
    if (table.galeria) return;

    // Nullable: as publicações já existentes ficam sem galeria, e o mapper
    // trata null como lista vazia — nenhuma linha precisa de backfill.
    await queryInterface.addColumn("blog-posts", "galeria", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("blog-posts");
    if (!table.galeria) return;

    await queryInterface.removeColumn("blog-posts", "galeria");
  },
};
