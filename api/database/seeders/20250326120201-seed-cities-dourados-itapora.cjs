"use strict";

/**
 * Dados resumidos (nome, UF, população aproximada, contexto regional) a partir de
 * IBGE/Wikipédia em português — apenas o necessário para o modelo `cities`.
 */
const CITIES = [
  {
    name: "Dourados",
    slug: "dourados",
    state: "MS",
    summary:
      "Município no sul de Mato Grosso do Sul, entre a Serra de Maracaju e a bacia do Paraná; maior cidade do interior do estado e polo regional de serviços e agropecuária.",
    description:
      "Estimativa IBGE 2025: cerca de 264 mil habitantes. Distância aproximada de 235 km de Campo Grande. Gentílico: douradense. Conhecida como “Portal do Mercosul” por sua posição estratégica na fronteira.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/Skyline_of_Dourados_150257.jpg",
    published: true,
  },
  {
    name: "Itaporã",
    slug: "itapora",
    state: "MS",
    summary:
      "Município no sudoeste de Mato Grosso do Sul, na microrregião de Dourados; economia ligada à agropecuária, piscicultura e indústria.",
    description:
      "População estimada pelo IBGE (2023): cerca de 24 mil habitantes. Gentílico: itaporanense. Apelidada de “Cidade do Peixe” pela produção de piscicultura. Topônimo de origem tupi: “pedra bonita”.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/Bandeira_Itapor%C3%A3.png",
    published: true,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    for (const city of CITIES) {
      const [found] = await queryInterface.sequelize.query(
        "SELECT id FROM cities WHERE slug = :slug LIMIT 1",
        {
          replacements: { slug: city.slug },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
      if (found) continue;

      await queryInterface.bulkInsert("cities", [
        {
          ...city,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE FROM cities WHERE slug IN (:s1, :s2)",
      {
        replacements: { s1: CITIES[0].slug, s2: CITIES[1].slug },
      },
    );
  },
};
