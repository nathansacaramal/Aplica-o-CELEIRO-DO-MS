// src/modules/blog/infra/model/blog-post-model.ts
import sequelize from "@/core/database";
import { DataTypes, Model } from "sequelize";

class BlogPostModel extends Model {
  id!: number;
  titulo!: string;
  slug!: string;
  resumo!: string;
  conteudo!: string;
  imagemDestaque!: string;
  galeria!: string[] | null;
  status!: string;
  dataPublicacao!: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

BlogPostModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      // Nome fixo evita que `sync({ alter: true })` crie um novo índice único a
      // cada restart em dev (mesmo motivo documentado em event-model.ts).
      unique: "blog_posts_slug_unique",
    },
    resumo: { type: DataTypes.TEXT, allowNull: false },
    conteudo: { type: DataTypes.TEXT("long"), allowNull: false },
    imagemDestaque: { type: DataTypes.STRING, allowNull: false },
    // Nullable: publicações criadas antes da galeria existir seguem com null,
    // que o mapper normaliza para lista vazia.
    galeria: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "draft" },
    dataPublicacao: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: "blog-posts",
    timestamps: true,
  },
);

export default BlogPostModel;
