#!/usr/bin/env node
/**
 * Smoke pós-deploy: GET /health e GET /ready no ALB (ou URL base qualquer).
 *
 * Uso:
 *   SMOKE_BASE_URL=http://k8s-xxx.elb.amazonaws.com yarn smoke:alb
 *   yarn smoke:alb http://127.0.0.1:3000
 *
 * SMOKE_SKIP_READY=true — pula /ready (ex.: sem DB acessível na URL pública).
 */
"use strict";

const baseRaw = process.env.SMOKE_BASE_URL || process.argv[2];
const skipReady = process.env.SMOKE_SKIP_READY === "true";

if (!baseRaw) {
  console.error(
    "Defina SMOKE_BASE_URL ou passe a URL base como primeiro argumento.",
  );
  process.exit(1);
}

const base = baseRaw.replace(/\/$/, "");

async function getJson(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { res, body, url };
}

async function main() {
  const h = await getJson("/health");
  if (!h.res.ok || h.body?.status !== "ok") {
    console.error("GET /health falhou", h.res.status, h.body);
    process.exit(1);
  }
  console.log("OK /health", h.url);

  if (skipReady) {
    console.log("SKIP /ready (SMOKE_SKIP_READY)");
    return;
  }

  const r = await getJson("/ready");
  if (!r.res.ok || r.body?.status !== "ready") {
    console.error("GET /ready falhou", r.res.status, r.body);
    process.exit(1);
  }
  console.log("OK /ready", r.url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
