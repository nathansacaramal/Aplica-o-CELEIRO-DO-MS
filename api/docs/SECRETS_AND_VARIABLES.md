# GitHub Actions — Secrets e Variables

Nomes **exatos** esperados por [`.github/workflows/deploy-aws.yml`](../.github/workflows/deploy-aws.yml).  
Variáveis sensíveis → **Secrets**. Valores operacionais não secretos → **Repository variables** (recomendado).

## Secrets (repositório)

| Secret | Obrigatório para | Origem típica |
|--------|-------------------|---------------|
| **`AWS_ROLE_TO_ASSUME`** | Deploy + Terraform plan | ARN IAM OIDC ([github-oidc-aws.md](./deployment/github-oidc-aws.md) ou [github-oidc-iam](../infra/aws/github-oidc-iam/README.md)) |
| **`ECR_REPOSITORY_URL`** | Deploy | `terraform output -raw ecr_repository_url` (foundation) |
| **`ECS_CLUSTER_NAME`** | Deploy | `terraform output -raw ecs_cluster_name` |
| **`ECS_SERVICE_NAME`** | Deploy | `terraform output -raw ecs_service_name` |
| **`TF_JWT_SECRET`** | Job Terraform plan | Mesmo valor lógico de `jwt_secret` no tfvars (≥16 caracteres) |
| **`TF_JWT_ACCESS_SECRET`** | Job Terraform plan | `jwt_access_secret` |
| **`TF_JWT_REFRESH_SECRET`** | Job Terraform plan | `jwt_refresh_secret` |
| **`TF_EXTERNAL_DB_PASSWORD`** | Plan | Só se `TF_USE_MANAGED_RDS=false` e banco externo |
| **`SMOKE_BASE_URL`** | Smoke | Opcional; pode ser Variable em vez de Secret |
| **`AWS_REGION`** | Qualquer job AWS | Opcional se existir Variable `AWS_REGION` |

### Secrets aceitos como alternativa a Variables (backend state)

O workflow usa `vars || secrets` para:

- `TF_STATE_BUCKET`, `TF_STATE_KEY`, `TF_STATE_REGION`, `TF_STATE_DYNAMODB_TABLE`  

**Recomendação:** usar **Variables** para estes (não são credenciais).

### Legado

- **`TERRAFORM_TFVARS`** — **não usado** pelo workflow atual; pode ser removido após migração para `TF_JWT_*` + Variables.

---

## Variables (repositório)

| Variable | Obrigatório para | Notas |
|----------|------------------|--------|
| **`AWS_REGION`** | Deploy / plan | ex.: `us-east-1` |
| **`TF_MEDIA_BUCKET_NAME`** | Terraform plan | Output `bucket_name` (s3-phase1) |
| **`TF_S3_PUBLIC_BASE_URL`** | Terraform plan | Output `s3_public_base_url` (s3-phase1) |
| **`TF_STATE_BUCKET`** | Terraform plan | Bucket de **state** (terraform-remote-state) |
| **`TF_STATE_KEY`** | Terraform plan | ex.: `foundation/terraform.tfstate` |
| **`TF_STATE_REGION`** | Plan | Opcional; default = `AWS_REGION` |
| **`TF_STATE_DYNAMODB_TABLE`** | Plan | Opcional; lock DynamoDB |
| **`SMOKE_BASE_URL`** | Espera ECS + smoke | Base URL pública (ALB) |
| **`SMOKE_SKIP_READY`** | Smoke | `true` para pular `GET /ready` |

### Variables opcionais (override `TF_VAR_*` no plan)

| Variable | Default no workflow (se omitida) |
|----------|----------------------------------|
| `TF_PROJECT_NAME` | `catalogo-eventos-api` |
| `TF_ENVIRONMENT` | `dev` |
| `TF_CONTAINER_IMAGE` | imagem nginx pública |
| `TF_CONTAINER_PORT` | `80` |
| `TF_HEALTH_CHECK_PATH` | `/` |
| `TF_DESIRED_COUNT` | `1` |
| `TF_USE_MANAGED_RDS` | `true` |
| `TF_EXTERNAL_DB_HOST` | vazio |
| `TF_NAT_GATEWAY_ENABLED` | `false` |
| `TF_ACM_CERTIFICATE_ARN` | vazio |
| `TF_ENABLE_APIGATEWAYV2_ALB_PROXY` | `false` |
| `TF_BOOTSTRAP_ADMIN_EMAIL` | `admin@catalogo-eventos.com.br` |

---

## Permissões IAM da role (`AWS_ROLE_TO_ASSUME`)

- **Deploy:** ECR push + ECS `UpdateService` / `Describe*` no cluster alvo — ver [github-oidc-aws.md](./deployment/github-oidc-aws.md).  
- **Terraform plan:** normalmente **`ReadOnlyAccess`** + política de **DynamoDB lock** na tabela de state — mesma doc, seção 2.3.

---

## Onde configurar no GitHub

**Settings** → **Secrets and variables** → **Actions** → *Repository secrets* / *Variables*.

## Documentação relacionada

- [github-actions-aws.md](./deployment/github-actions-aws.md)  
- [CLIENT_HANDOVER.md](./CLIENT_HANDOVER.md)  
