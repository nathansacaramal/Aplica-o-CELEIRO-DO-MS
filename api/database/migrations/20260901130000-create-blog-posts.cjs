"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("blog-posts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false },
      resumo: { type: Sequelize.TEXT, allowNull: false },
      conteudo: { type: Sequelize.TEXT("long"), allowNull: false },
      imagemDestaque: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "draft" },
      dataPublicacao: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("blog-posts", ["slug"], {
      name: "blog_posts_slug_unique",
      unique: true,
    });
    await queryInterface.addIndex("blog-posts", ["status", "dataPublicacao"], {
      name: "blog_posts_status_data_publicacao_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface
      .removeIndex("blog-posts", "blog_posts_status_data_publicacao_idx")
      .catch(() => {});
    await queryInterface.removeIndex("blog-posts", "blog_posts_slug_unique").catch(() => {});
    await queryInterface.dropTable("blog-posts");
  },
};
