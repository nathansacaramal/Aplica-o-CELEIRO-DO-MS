"use strict";

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Preenche `slug` a partir de `name` para linhas já existentes, sem duplicar valores. */
async function backfillSlugs(queryInterface, tableName) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id, name FROM \`${tableName}\` WHERE slug IS NULL OR slug = ''`,
  );

  const usedSlugs = new Set();
  for (const row of rows) {
    const base = slugify(row.name) || `${tableName}-${row.id}`;
    let candidate = base;
    let counter = 2;
    while (usedSlugs.has(candidate)) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }
    usedSlugs.add(candidate);

    await queryInterface.sequelize.query(`UPDATE \`${tableName}\` SET slug = ? WHERE id = ?`, {
      replacements: [candidate, row.id],
    });
  }
}

/**
 * `home-highlights.ctaUrl` guarda um link estático calculado no momento do
 * cadastro (ex.: "/eventos/5"). Como o site público passa a navegar por
 * slug, recalculamos esses links a partir do slug já definido acima —
 * senão os destaques da home quebrariam depois do deploy.
 */
async function backfillHighlightCtaUrls(queryInterface) {
  const [highlights] = await queryInterface.sequelize.query(
    `SELECT id, type, referenceId FROM \`home-highlights\` WHERE type IN ('event', 'tourist-point')`,
  );

  for (const highlight of highlights) {
    const table = highlight.type === "event" ? "events" : "tourist-points";
    const basePath = highlight.type === "event" ? "/eventos" : "/pontos-turisticos";

    const [[found]] = await queryInterface.sequelize.query(
      `SELECT slug FROM \`${table}\` WHERE id = ?`,
      { replacements: [highlight.referenceId] },
    );
    if (!found) continue;

    await queryInterface.sequelize.query(
      `UPDATE \`home-highlights\` SET ctaUrl = ? WHERE id = ?`,
      { replacements: [`${basePath}/${found.slug}`, highlight.id] },
    );
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("events", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("tourist-points", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await backfillSlugs(queryInterface, "events");
    await backfillSlugs(queryInterface, "tourist-points");
    await backfillHighlightCtaUrls(queryInterface);

    await queryInterface.changeColumn("events", "slug", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tourist-points", "slug", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addIndex("events", ["slug"], {
      unique: true,
      name: "events_slug_unique",
    });
    await queryInterface.addIndex("tourist-points", ["slug"], {
      unique: true,
      name: "tourist_points_slug_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("events", "events_slug_unique").catch(() => {});
    await queryInterface.removeIndex("tourist-points", "tourist_points_slug_unique").catch(() => {});
    await queryInterface.removeColumn("events", "slug");
    await queryInterface.removeColumn("tourist-points", "slug");
  },
};
