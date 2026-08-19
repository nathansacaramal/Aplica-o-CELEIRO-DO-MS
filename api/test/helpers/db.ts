// tests/helpers/db.ts
import sequelize from "@/core/database";

export async function resetDb() {
  // Limpa todas as tabelas e reinicia IDs
  await sequelize.truncate({ cascade: true, restartIdentity: true });
}

export async function syncDb() {
  await sequelize.sync({ force: true });
}

export async function closeDb() {
  await sequelize.close();
}
