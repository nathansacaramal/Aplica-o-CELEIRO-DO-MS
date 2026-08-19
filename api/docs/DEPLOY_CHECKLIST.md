# Checklist de deploy — conta AWS nova + GitHub do cliente

Use como **ordem de execução** auditável. Marque cada item ao concluir.

## Pré-requisitos

- [ ] Conta AWS do cliente com usuário/role para `terraform apply` (laboratório: amplo; produção: política mínima necessária).
- [ ] Terraform ≥ 1.5, AWS CLI, Node 22 + Yarn (para build local opcional).
- [ ] Repositório GitHub do cliente criado e código enviado (`git push`).
- [ ] Região AWS escolhida (ex.: `us-east-1`) **consistente** em todos os stacks.

---

## Fase A — Terraform (ordem recomendada)

- [ ] **A1.** `infra/aws/terraform-remote-state` — `init` / `apply` → anotar bucket, key sugerida, tabela DynamoDB (outputs).  
- [ ] **A2.** `infra/aws/s3-phase1` — `apply` → anotar `bucket_name`, `s3_public_base_url`.  
- [ ] **A3.** `infra/aws/foundation` — criar `terraform.tfvars` (não commitar) a partir de `terraform.tfvars.example`, preenchendo mídia (A2) e segredos JWT.  
  - [ ] Configurar **backend remoto** apontando para A1 (`init -backend-config=...` ou migrar state).  
  - [ ] `terraform apply` → anotar `ecr_repository_url`, `ecs_cluster_name`, `ecs_service_name` (ou equivalentes em outputs).  
- [ ] **A4 (opcional).** `infra/aws/github-oidc-iam` — preencher `github_org`, `github_repo`; após A3 preencher `ecr_repository_name` (ex.: `{project}-{env}-api`), `ecs_cluster_name`, `terraform_lock_table_arn`; `apply` → anotar `iam_role_arn`.  
  - [ ] *Alternativa:* configurar OIDC + role **manualmente** conforme [deployment/github-oidc-aws.md](./deployment/github-oidc-aws.md).  
- [ ] **A5 (opcional).** `infra/aws/aurora-phase2` — somente se não usar RDS do `foundation`; ver [deployment/aurora-phase2.md](./deployment/aurora-phase2.md).

---

## Fase B — GitHub (repositório do cliente)

- [ ] **B1.** Secret **`AWS_ROLE_TO_ASSUME`** = ARN da role (A4 ou manual).  
- [ ] **B2.** Secrets de deploy: **`ECR_REPOSITORY_URL`**, **`ECS_CLUSTER_NAME`**, **`ECS_SERVICE_NAME`** (outputs do foundation).  
- [ ] **B3.** **`AWS_REGION`** — Variable ou Secret (workflow aceita ambos).  
- [ ] **B4.** Job **Terraform plan** (se usado): ver [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) — `TF_STATE_*`, `TF_MEDIA_*`, `TF_JWT_*`, opcionais.  
- [ ] **B5.** (Opcional) **`SMOKE_BASE_URL`** — Variable ou Secret para smoke pós-deploy.  

---

## Fase C — Primeiro pipeline

- [ ] **C1.** Actions → **Deploy AWS (ECR + ECS)** → *Run workflow* (branch correta).  
- [ ] **C2.** Confirmar job **deploy** verde: build, push ECR, `UpdateService`.  
- [ ] **C3.** (Opcional) Marcar **run_terraform_plan** e confirmar job **Terraform plan** verde.  
- [ ] **C4.** HTTP: `GET /health` na URL pública do ALB (ou API Gateway, se habilitado).  

---

## Fase D — Pós-deploy aplicacional

- [ ] **D1.** Migrações: conforme [database-migrations.md](./deployment/database-migrations.md) (task ECS / bastion).  
- [ ] **D2.** Seed / admin inicial se aplicável ([secrets-jwt-fargate.md](./deployment/secrets-jwt-fargate.md), variáveis `bootstrap_*`).  

---

## Validação mínima de sucesso

| Critério | Como validar |
|----------|----------------|
| Infra aplicada | `terraform output` no foundation retorna URLs/ARNs esperados |
| Imagem no ECR | Console ECR ou log do workflow |
| Serviço estável | Log `aws ecs wait services-stable` (se smoke habilitado) |
| API viva | `curl` em `/health` |

---

## Rollback (macro)

1. **Workflow** — novo run com tag anterior ou imagem anterior no ECR + deploy.  
2. **Terraform** — `terraform plan` no último state conhecido; `apply` reverso só com cuidado em produção.  
3. **Git** — reverter commit que alterou workflows ou `infra/`.  

Detalhes: [OPERATION_GUIDE.md](./OPERATION_GUIDE.md).
