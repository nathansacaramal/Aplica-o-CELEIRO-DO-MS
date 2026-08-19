# Variáveis de ambiente (produção / AWS)

Validação em runtime: `src/core/config/env.ts` (Zod). Falha na validação **encerra o processo** (`process.exit(1)`).

## Aplicação

| Variável | Obrigatório | Padrão / notas |
|----------|-------------|----------------|
| `NODE_ENV` | não | `development` — use `production` no Fargate |
| `PORT` | não | `3000` — alinhar com target group / container |
| `SWAGGER_ENABLED` | não | `true` — em produção costuma ser `false` |
| `FORCE_HTTPS_REDIRECT` | não | `false` — `true` atrás do ALB com ACM (ECS define quando há certificado); redireciona se `X-Forwarded-Proto: http` |
| `JWT_SECRET` | sim (≥16 chars) | Base para fallbacks legados |
| `JWT_ACCESS_SECRET` | sim (≥16 chars) | Verificação no `auth-middleware` |
| `JWT_REFRESH_SECRET` | sim (≥16 chars) | Refresh token |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | não | Access / refresh TTL |
| `UPDATE_MODEL` | não | `false` — se `true`, boot executa `sync` (ver [database-migrations.md](./database-migrations.md)) |
| `READINESS_CHECK_DB` | não | `true` — se `false`, `GET /ready` não chama o banco |
| `SALT`, `ADMIN_PASSWORD` | não | Seed/admin local |

## Banco (Aurora / RDS MySQL compatível)

| Variável | Notas |
|----------|--------|
| `DB_DIALECT` | `mysql` (ou `mariadb`, `postgres` conforme suporte Sequelize) |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Endpoint do cluster / instance |
| `DB_SSL` | `true` em produção típica na AWS |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` com certificados válidos; `false` só em debug |
| `DB_SSL_CA_PATH` | Opcional — PEM da AWS ([RDS CA bundle](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html)); use com Aurora e `rejectUnauthorized=true` |
| `DB_POOL_MAX`, `DB_POOL_MIN`, `DB_POOL_ACQUIRE_MS`, `DB_POOL_IDLE_MS` | Ajustar por tamanho da task × `max_connections` do Aurora |

## Mídia (S3)

| Variável | Notas |
|----------|--------|
| `MEDIA_STORAGE` | `local` ou `s3` |
| `S3_BUCKET`, `AWS_REGION`, `S3_PUBLIC_BASE_URL` | Obrigatórios para ramo S3 em `compose-public-web-image-uploader.ts` |
| `S3_PUBLIC_PREFIX`, `S3_STORAGE_CLASS` | Prefixo de chave e classe de armazenamento |
| `PUBLIC_MEDIA_BASE_URL` | Opcional; origem para URLs “owned” e delete |

## Imagens web

`WEB_IMAGE_MAX_WIDTH`, `WEB_IMAGE_MAX_HEIGHT`, `WEB_IMAGE_WEBP_QUALITY`

## Credenciais AWS (SDK v3) — **não** listadas no Zod

O cliente S3 (`@aws-sdk/client-s3`) usa a **cadeia padrão de credenciais**:

- **Fargate / ECS**: IAM task role (recomendado).
- Local: `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (ou profile), `AWS_REGION`.

Defina **`AWS_REGION`** na task se não estiver implícito no ambiente de execução.
