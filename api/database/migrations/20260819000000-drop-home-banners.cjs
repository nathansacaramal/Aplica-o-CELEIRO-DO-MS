"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeIndex("home-banners", "home_banners_active_order_idx").catch(() => {});
    await queryInterface.dropTable("home-banners");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable("home-banners", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      subtitle: { type: Sequelize.STRING, allowNull: false },
      imageUrl: { type: Sequelize.STRING, allowNull: false },
      ctaLabel: { type: Sequelize.STRING, allowNull: false },
      ctaUrl: { type: Sequelize.STRING, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false },
      order: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("home-banners", ["active", "order"], {
      name: "home_banners_active_order_idx",
    });
  },
};
