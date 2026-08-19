# Banco de dados: `sync` vs migrations

## Estado atual

- **Models** Sequelize vivem em `src/modules/*/infra/model/*-model.ts`.
- No boot (`initializeDatabaseAndServer`), se `UPDATE_MODEL=true`, a aplicação carrega models, associa e chama `sequelize.sync()` com opções que dependem de `NODE_ENV` (ex.: `force` em test, `alter` em development).

## Política recomendada para Aurora / produção

1. **`UPDATE_MODEL=false` em produção** (padrão atual) — evita `sync` automático contra dados reais.
2. **Alterações de schema versionadas** com **Sequelize CLI** (`database/migrations/`).
3. Rodar **`yarn db:migrate`** (ou equivalente no pipeline) **antes** ou como etapa controlada do deploy, com backup e janela de manutenção quando necessário.
4. Manter **`GET /ready`** com `READINESS_CHECK_DB=true` para o target group só receber tráfego quando o app **e** a conexão com o banco estiverem ok.

## Comandos

Configuração: `.sequelizerc` + `database/sequelize-cli-config.cjs` (lê `.env` / `.env.<NODE_ENV>` na raiz do repo). Com **`DB_SSL=true`** e MySQL **sem** **`DB_SSL_CA_PATH`**, o mysql2 usa o perfil embutido **Amazon RDS** (`aws-ssl-profiles`) — recomendado para RDS/Aurora. Com **`DB_SSL_CA_PATH`** definido, só o PEM desse caminho é usado (se estiver errado/desatualizado, aparece *self-signed certificate in certificate chain*).

A imagem Docker **copia** `certs/` para `/app/certs/` (bundle versionado no repo); a task ECS **não** precisa definir `DB_SSL_CA_PATH` para o fluxo padrão com RDS.

### TLS: erro *self-signed certificate in certificate chain*

1. Confira se **`DB_SSL_CA_PATH` está vazio** no shell (`unset DB_SSL_CA_PATH`) e nos `.env*` usados pelo CLI.
2. Só use PEM em disco se tiver motivo (CA customizada, proxy corporativo, etc.).

```bash
# NODE_ENV define qual chave do config é usada (development | test | production)
export NODE_ENV=production
yarn db:migrate          # aplica pendentes
yarn db:migrate:status   # inspeciona
yarn db:migrate:undo     # desfaz última (use com cuidado)
yarn db:seed             # aplica seeders (admin inicial + cidades MS)
yarn db:seed:undo        # desfaz todos os seeders registrados
yarn db:bootstrap        # migrate + seed (ambiente local/staging com .env)
```

A migration `20250326120000-phase1-schema-placeholder` é **no-op** (histórico / `SequelizeMeta`). O DDL das tabelas da aplicação está em `20250326120100-create-application-schema.cjs`. O seeder de admin exige **`ADMIN_EMAIL`** e **`ADMIN_PASSWORD`** no ambiente (hash bcrypt com 12 rounds). Em produção, `env.ts` exige que ambas existam em `process.env` (ECS: `ADMIN_EMAIL` na task + `ADMIN_PASSWORD` via Secrets Manager — ver `infra/aws/foundation/ecs.tf`).

O workflow **CI** (`.github/workflows/ci.yml`, job `database`) sobe **MySQL 8** em serviço e executa `yarn db:bootstrap` para validar migrations e seeders em cada push/PR.

## Rodar migrate **de dentro da VPC** (RDS privado)

O MySQL do `foundation` não tem endpoint público; da sua máquina na internet o `yarn db:migrate` não conecta. Opções:

### 1) ECS **Run Task** (recomendado com este repositório)

A imagem de produção inclui `database/`, `.sequelizerc` e `sequelize-cli`; as variáveis `DB_*` e o segredo vêm da **mesma task definition** do serviço (já apontam para o RDS).

1. Faça **build e push** da imagem para o ECR (Dockerfile atualizado).
2. Atualize o serviço ECS (ou force new deployment) para usar a nova imagem.
3. No diretório do projeto:

   ```bash
   ./scripts/ecs-run-db-migrate.sh
   ./scripts/ecs-run-db-seed.sh
   ```

   O migrate **não** roda seed. Após migrar, execute **`ecs-run-db-seed.sh`** uma vez (ou quando precisar recriar dados iniciais). Os scripts leem `ecs_cluster_name` e `ecs_service_name` via Terraform, copiam subnets/SG do serviço e disparam tasks Fargate com `yarn db:migrate` / `yarn db:seed` (sem ALB). A task usa a mesma definição do serviço, incluindo `ADMIN_*`.

4. Acompanhe em **CloudWatch Logs** → grupo `/ecs/<project>-<env>` (stream da task).

### 2) Outras formas

- **AWS CodeBuild** na mesma VPC/subnets com acesso ao RDS (checkout do repo + `yarn install --frozen-lockfile` + `yarn db:migrate` com `DB_*` em variáveis ou Secrets Manager).
- **Bastion** (EC2 ou SSM) na VPC com Node + clone do repo + `.env` com `DB_HOST` interno.
- **Runner de CI** (GitHub self-hosted, etc.) com interface de rede na VPC.

MySQL local opcional: `docker compose -f docker-compose.mysql.yml up -d` (credenciais espelham `.env-exemplo`; ajuste o `.env` se mudar usuário ou senha).

## Sequelize CLI e dialect

O `sequelize-cli-config.cjs` usa o mesmo `DB_*` da aplicação. Para **SQLite** (testes da app), o CLI ainda aponta para MySQL por padrão — use migrations contra um banco de desenvolvimento/staging compatível com produção.

## Build / artefatos

Migrations **não** são copiadas para `dist/` pelo TypeScript. O deploy deve:

- executar migrations a partir do **repositório** (CI/CD) ou de uma imagem que inclua a pasta `database/`, ou
- usar imagem de release que rode `sequelize-cli` com os arquivos versionados.
