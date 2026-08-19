# Deploy e operação (Fase 1)

Documentação operacional para publicação em AWS (Fargate, Aurora, S3) **sem** substituir o código de aplicação.

**Entrega / transferência para outro GitHub ou conta AWS:** ver o hub [**`docs/index.md`**](../index.md) e em especial [**`CLIENT_HANDOVER.md`**](../CLIENT_HANDOVER.md), [**`DEPLOY_CHECKLIST.md`**](../DEPLOY_CHECKLIST.md), [**`SECRETS_AND_VARIABLES.md`**](../SECRETS_AND_VARIABLES.md).

| Documento | Conteúdo |
|-----------|----------|
| [environment-variables.md](./environment-variables.md) | Matriz de variáveis (app + AWS SDK implícito) |
| [database-migrations.md](./database-migrations.md) | Política `sync` vs migrations e comandos `db:migrate` |
| [secrets-jwt-fargate.md](./secrets-jwt-fargate.md) | Secrets Manager, task role e rotação de JWT |
| [pre-implementacao-e-deploy.md](./pre-implementacao-e-deploy.md) | **Ler antes** de novas implementações grandes e de preparar deploy (segredos, ordem de deploy, CI DB, `sync` vs migrations) |
| [s3-phase1.md](./s3-phase1.md) | **Fase 1 S3**: bucket, IAM mínimo, integração local, `GET /media/verify`, checklist e rollback |
| [../infra/aws/foundation/README.md](../../infra/aws/foundation/README.md) | **Foundation AWS** (Terraform): VPC, RDS MySQL, ECR, ALB, ECS Fargate, Secrets — ordem: S3 → foundation → `aws configure` |
| [aurora-phase2.md](./aurora-phase2.md) | **Fase 2 Aurora MySQL** (sem proxy): Terraform `aurora-phase2`, SSL/Sequelize, `npm run verify:aurora-db` |
| [phase3-ecs-publish.md](./phase3-ecs-publish.md) | **Fase 3 ECS Fargate**: Docker, ECR, ALB, variáveis/segredos, Aurora ou RDS, smoke `/health` e `/ready`, checklist e rollback |
| [github-actions-aws.md](./github-actions-aws.md) | **CD no GitHub Actions**: ECR + `force-new-deployment` no ECS (secrets, limites vs Terraform/migrations) |
| [github-oidc-aws.md](./github-oidc-aws.md) | **OIDC GitHub → AWS**: provedor IAM, trust policy, role, `AWS_ROLE_TO_ASSUME` |

**Checks locais / CI**

- `GET /health` — liveness (sem banco).
- `GET /ready` — readiness com `sequelize.authenticate()` (desligável via `READINESS_CHECK_DB=false`).
- `npm run smoke:alb` — smoke pós-deploy no ALB (`SMOKE_BASE_URL`); ver Fase 3.
- `npm run build && npm run verify:dist` — confirma `dist/server.js` e Swagger em `dist/core/docs`.
