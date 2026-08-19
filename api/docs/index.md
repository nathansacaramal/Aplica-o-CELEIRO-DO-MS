# Documentação — índice

Ponto de entrada para **desenvolvimento**, **deploy AWS**, **CI/CD GitHub** e **entrega ao cliente**.

## Entrega e transferência (handover)

| Documento | Uso |
|-----------|-----|
| [**EXECUTIVE_HANDOVER_SUMMARY.md**](./EXECUTIVE_HANDOVER_SUMMARY.md) | **Resumo executivo** (1 página): entrega, posse, automação vs manual, riscos, recomendações |
| [**CLIENT_HANDOVER.md**](./CLIENT_HANDOVER.md) | Visão executiva: o que transferir, ordem, riscos, veredito de prontidão |
| [**DEPLOY_CHECKLIST.md**](./DEPLOY_CHECKLIST.md) | Lista ordenada: conta nova → Terraform → GitHub → primeiro deploy |
| [**SECRETS_AND_VARIABLES.md**](./SECRETS_AND_VARIABLES.md) | Inventário de Secrets/Variables do GitHub Actions (nomes oficiais do workflow) |
| [**INFRASTRUCTURE_INVENTORY.md**](./INFRASTRUCTURE_INVENTORY.md) | O que o Terraform cria vs o que permanece manual |
| [**OPERATION_GUIDE.md**](./OPERATION_GUIDE.md) | Operação do dia a dia: deploy, plan, migrações, smoke, rollback |

## Deploy e infraestrutura (detalhe)

| Área | Documento |
|------|-----------|
| Hub deploy | [deployment/README.md](./deployment/README.md) |
| GitHub Actions + ECS/ECR | [deployment/github-actions-aws.md](./deployment/github-actions-aws.md) |
| OIDC IAM (manual ou Terraform) | [deployment/github-oidc-aws.md](./deployment/github-oidc-aws.md) |
| S3 mídia (Fase 1) | [deployment/s3-phase1.md](./deployment/s3-phase1.md) |
| Foundation (VPC, RDS, ECS, ALB…) | [../infra/aws/foundation/README.md](../infra/aws/foundation/README.md) |
| State remoto (bucket + DynamoDB) | [../infra/aws/terraform-remote-state/README.md](../infra/aws/terraform-remote-state/README.md) |
| OIDC + role via Terraform | [../infra/aws/github-oidc-iam/README.md](../infra/aws/github-oidc-iam/README.md) |
| Aurora (opcional) | [deployment/aurora-phase2.md](./deployment/aurora-phase2.md) |
| Publicar imagem / Fase 3 | [deployment/phase3-ecs-publish.md](./deployment/phase3-ecs-publish.md) |
| Variáveis da aplicação | [deployment/environment-variables.md](./deployment/environment-variables.md) |
| Migrações de banco | [deployment/database-migrations.md](./deployment/database-migrations.md) |

## Arquitetura de software

| Documento | Conteúdo |
|-----------|-----------|
| [architecture/api-guidelines.md](./architecture/api-guidelines.md) | Contratos HTTP, erros, Swagger |
| [architecture/modular-architecture-guidelines.md](./architecture/modular-architecture-guidelines.md) | Módulos e camadas |
| Outros | [architecture/](./architecture/) |

## Raiz do repositório

- [README.md](../README.md) — clonar, rodar local, ordem macro de infra AWS
