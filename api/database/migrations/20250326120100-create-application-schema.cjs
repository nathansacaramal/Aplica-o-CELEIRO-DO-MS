"use strict";

/**
 * Esquema inicial alinhado aos models Sequelize (tabelas, FKs, índices).
 * A migration anterior (phase1-schema-placeholder) permanece no histórico como no-op.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM("Admin"),
        allowNull: false,
        defaultValue: "Admin",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("admins", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("admins", ["userId"], {
      unique: true,
      name: "admins_user_id_unique",
    });

    await queryInterface.createTable("cities", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING, allowNull: true },
      summary: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      imageUrl: { type: Sequelize.STRING, allowNull: false },
      published: { type: Sequelize.BOOLEAN, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("cities", ["slug"], {
      unique: true,
      name: "cities_slug_unique",
    });
    await queryInterface.addIndex("cities", ["published"], {
      name: "cities_published_idx",
    });

    await queryInterface.createTable("events", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      cityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "cities", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      citySlug: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      startDate: { type: Sequelize.DATE, allowNull: false },
      endDate: { type: Sequelize.DATE, allowNull: false },
      formattedDate: { type: Sequelize.STRING, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: false },
      imageUrl: { type: Sequelize.STRING, allowNull: false },
      featured: { type: Sequelize.BOOLEAN, allowNull: false },
      published: { type: Sequelize.BOOLEAN, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("events", ["cityId"], {
      name: "events_city_id_idx",
    });
    await queryInterface.addIndex("events", ["published", "featured"], {
      name: "events_published_featured_idx",
    });

    await queryInterface.createTable("tourist-points", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      cityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "cities", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      citySlug: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.STRING, allowNull: true },
      category: {
        type: Sequelize.ENUM("parque", "praça", "museu", "igreja"),
        allowNull: false,
      },
      address: { type: Sequelize.STRING, allowNull: true },
      openingHours: { type: Sequelize.TIME, allowNull: false },
      imageUrl: { type: Sequelize.STRING, allowNull: false },
      featured: { type: Sequelize.BOOLEAN, allowNull: false },
      published: { type: Sequelize.BOOLEAN, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("tourist-points", ["cityId"], {
      name: "tourist_points_city_id_idx",
    });

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

    await queryInterface.createTable("home-highlights", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: { type: Sequelize.STRING, allowNull: false },
      referenceId: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      imageUrl: { type: Sequelize.STRING, allowNull: false },
      cityName: { type: Sequelize.STRING, allowNull: false },
      ctaUrl: { type: Sequelize.STRING, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false },
      order: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex("home-highlights", ["active", "order"], {
      name: "home_highlights_active_order_idx",
    });

    await queryInterface.createTable("institutional-content", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      aboutTitle: { type: Sequelize.STRING, allowNull: false },
      aboutText: { type: Sequelize.STRING, allowNull: false },
      whoWeAreTitle: { type: Sequelize.STRING, allowNull: false },
      WhoWeAreText: { type: Sequelize.STRING, allowNull: false },
      purposeTitle: { type: Sequelize.STRING, allowNull: false },
      purposeText: { type: Sequelize.STRING, allowNull: false },
      mission: { type: Sequelize.STRING, allowNull: false },
      vision: { type: Sequelize.STRING, allowNull: false },
      valuesJson: { type: Sequelize.JSON, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.createTable("social-media-links", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      platform: { type: Sequelize.STRING, allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      url: { type: Sequelize.STRING, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      order: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("social-media-links", ["active", "order"], {
      name: "social_media_links_active_order_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("social-media-links");
    await queryInterface.dropTable("institutional-content");
    await queryInterface.dropTable("home-highlights");
    await queryInterface.dropTable("home-banners");
    await queryInterface.dropTable("tourist-points");
    await queryInterface.dropTable("events");
    await queryInterface.dropTable("admins");
    await queryInterface.dropTable("Users");
    await queryInterface.dropTable("cities");
  },
};
