"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("site-settings", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      key: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.JSON, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("site-settings", ["key"], {
      name: "site_settings_key_unique",
      unique: true,
    });

    await queryInterface.bulkInsert("site-settings", [
      {
        key: "maintenance_mode",
        value: JSON.stringify({ enabled: false }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("site-settings", "site_settings_key_unique").catch(() => {});
    await queryInterface.dropTable("site-settings");
  },
};
