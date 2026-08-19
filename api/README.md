# Catálogo de eventos — API (Node.js + Express + Sequelize)

**Repositório:** `catalogo-eventos-api` — ao clonar a partir do GitHub/GitLab com esse nome remoto, a pasta local padrão é `catalogo-eventos-api`.

API modular (`core` + contextos de negócio), pronta para execução local, testes em CI e publicação na **AWS** (S3, ECS Fargate, ALB, RDS MySQL, ECR). Este README concentra o fluxo para **clonar o repositório, criar uma conta AWS nova e subir o ambiente**, além de **manutenção, publicação de alterações** e **orientações para CI/CD no GitHub**.

Documentação complementar: **[índice geral `docs/index.md`](docs/index.md)** — deploy, handover ao cliente, secrets/variables, inventário de infra. Detalhe de deploy: [`docs/deployment/`](docs/deployment/README.md).

---

## Pré-requisitos na máquina do desenvolvedor

| Ferramenta | Uso |
|------------|-----|
| **Node.js 22** | Alinhado ao `Dockerfile` e ao CI (`nvm`, `fnm` ou instalador oficial). |
| **Yarn 1 (Classic)** | Lockfile `yarn.lock`; use **Corepack** (`corepack enable`) com Node 22. Comandos: `yarn install --frozen-lockfile`, `yarn <script>`. |
| **Docker** | Build da imagem de produção e push para o ECR. |
| **Terraform ≥ 1.5** | Infraestrutura em `infra/aws/`. |
| **AWS CLI v2** | `aws configure` e comandos opcionais de diagnóstico. |
| **Conta AWS** | Acesso ao console + usuário IAM com chave de acesso para Terraform/CLI (em laboratório costuma-se `AdministratorAccess`; em produção, política restrita). |

---

## 1. Clonar e rodar localmente

```bash
git clone <url-do-repositório>   # ex.: git@github.com:<org>/catalogo-eventos-api.git
cd catalogo-eventos-api          # nome da pasta = nome do repositório remoto
cp .env-exemplo .env   # ajuste variáveis (JWT ≥ 16 caracteres, DB, etc.)
corepack enable        # ativa o Yarn definido em package.json (uma vez por máquina)
yarn install --frozen-lockfile
yarn dev               # ou: yarn build && yarn start
```

Testes e qualidade:

```bash
yarn run check         # typecheck + format + lint + testes com cobertura (use `run`: `yarn check` é comando nativo do Yarn)
yarn smoke:http        # sobe servidor de teste e valida /health (ver script)
```

---

## 2. Conta AWS nova — primeiro acesso

1. Crie a **conta AWS** e faça login no [console](https://console.aws.amazon.com).
2. Crie um usuário **IAM** (ex.: `terraform-local`) **sem** usar a conta root no dia a dia.
3. Gere **Access key** (CLI): IAM → usuário → *Security credentials* → *Create access key*.
4. Na sua máquina:

```bash
aws configure
# Informe Access Key, Secret, região padrão (ex.: us-east-1), output json
aws sts get-caller-identity   # deve retornar Account e Arn
```

**Permissões:** o usuário que roda o Terraform precisa criar VPC, EC2, RDS, ECS, ECR, ALB, IAM (roles da task), Secrets Manager, CloudWatch, etc. Sem isso, o `plan`/`apply` falhará com `AccessDenied`.

---

## 3. Infraestrutura AWS (ordem obrigatória)

Use **sempre a mesma região** (ex.: `us-east-1`) em S3, foundation e `aws configure`.

### 3.1 Fase 1 — Bucket S3 (mídia)

```bash
cd infra/aws/s3-phase1
cp terraform.tfvars.example terraform.tfvars
# Edite: project_name, environment, aws_region, etc.
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

**Guarde os outputs** (serão usados no foundation):

```bash
terraform output -raw bucket_name
terraform output -raw s3_public_base_url
```

O nome do bucket inclui um **sufixo aleatório** (ex.: `catalogo-eventos-api-media-a1b2c3d4`). **Não** use placeholders como `xxxxxxxx` no próximo passo.

### 3.2 Foundation — VPC, RDS, ECR, ALB, ECS Fargate, Secrets

```bash
cd ../foundation
cp terraform.tfvars.example terraform.tfvars
```

Edite `terraform.tfvars`:

- `aws_region`, `project_name`, `environment`
- `media_bucket_name` = output **`bucket_name`** do passo 3.1
- `s3_public_base_url` = output **`s3_public_base_url`** (sem barra final)
- `jwt_secret`, `jwt_access_secret`, `jwt_refresh_secret` — **cada um com pelo menos 16 caracteres**
- **Primeiro deploy (opcional):** deixe comentadas `container_image`, `container_port`, `health_check_path` para validar ALB/ECS com a imagem **nginx** padrão do Terraform
- **API em produção:** após o push no ECR (seção 4), defina:

```hcl
container_image     = "<account>.dkr.ecr.<região>.amazonaws.com/<projeto>-<env>-api:<tag>"
container_port      = 3000
health_check_path   = "/health"
```

```bash
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Outputs úteis:

```bash
terraform output -raw ecr_repository_url
terraform output -raw alb_public_base_url
terraform output -raw ecs_cluster_name
terraform output -raw ecs_service_name
```

**Arquivos sensíveis:** `terraform.tfvars` está no `.gitignore` — **não commite** segredos. Use `*.example` como modelo.

**Produção endurecida (NAT, HTTPS ACM, WAF, alarmes):** veja [`infra/aws/foundation/terraform.tfvars.production.example`](infra/aws/foundation/terraform.tfvars.production.example) e [`docs/deployment/phase3-ecs-publish.md`](docs/deployment/phase3-ecs-publish.md).

---

## 4. Imagem Docker e publicação no ECR

Na **raiz do repositório** (`cd catalogo-eventos-api`):

```bash
corepack enable
yarn install --frozen-lockfile
yarn build
export AWS_REGION=us-east-1   # sua região
export ECR_REPOSITORY_URL="$(cd infra/aws/foundation && terraform output -raw ecr_repository_url)"
./scripts/ecr-build-push.sh
```

Opcional: tag imutável — `export IMAGE_TAG=v1.0.0` antes do script.

Atualize `container_image` no `foundation/terraform.tfvars` com a **mesma** URI + tag e rode:

```bash
cd infra/aws/foundation
terraform apply
```

**Novo deploy** só com nova imagem (mesma tag `latest` repushed):

```bash
export AWS_REGION=us-east-1
export ECS_CLUSTER_NAME="$(cd infra/aws/foundation && terraform output -raw ecs_cluster_name)"
export ECS_SERVICE_NAME="$(cd infra/aws/foundation && terraform output -raw ecs_service_name)"
./scripts/ecs-force-new-deployment.sh
```

---

## 5. Validação pós-deploy (smoke)

```bash
cd catalogo-eventos-api            # raiz do repositório clonado
export SMOKE_BASE_URL="$(cd infra/aws/foundation && terraform output -raw alb_public_base_url)"
yarn smoke:alb
```

- **`/health`** — liveness (sem banco).
- **`/ready`** — readiness com banco (se falhar, ver SG do RDS e migrations).

Se precisar isolar o ALB: `SMOKE_SKIP_READY=true yarn smoke:alb`.

---

## 6. Banco de dados e migrations

Em **produção** o Terraform define `UPDATE_MODEL=false` — o schema evolui com **migrations** (`database/migrations/`), não com `sync` automático.

O **RDS** criado pelo foundation fica em **subnet privada** e **não** é público. Para rodar `yarn db:migrate` ou `db:migrate:status` você precisa de **rota à VPC**: bastion, VPN, SSM port forwarding, task one-off no Fargate ou runner de CI na VPC.

Detalhes: [`docs/deployment/database-migrations.md`](docs/deployment/database-migrations.md).

---

## 7. S3 — checagens rápidas

```bash
BUCKET="$(cd infra/aws/s3-phase1 && terraform output -raw bucket_name)"
aws s3api head-bucket --bucket "$BUCKET"
```

Validação via API (admin + JWT): [`docs/deployment/s3-phase1.md`](docs/deployment/s3-phase1.md) (`GET /api/media/verify`).

---

## 8. Destruir a infraestrutura (reset de ambiente)

No **foundation**:

```bash
cd infra/aws/foundation
rm -f destroy.tfplan
terraform plan -destroy -out=destroy.tfplan
terraform apply destroy.tfplan
```

O repositório ECR está com **`force_delete = true`** para permitir apagar o repositório **com imagens**. Se usar um **plano de destroy antigo** gerado antes dessa configuração, gere um **novo** `plan -destroy` (planos salvos não “enxergam” alterações posteriores no `.tf`).

O **bucket S3** não é removido pelo foundation (apenas referenciado). Para apagar o bucket, use o destroy em `infra/aws/s3-phase1` (apaga também o conteúdo).

---

## 9. GitHub — CI existente

O repositório inclui [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

| Job | O que faz |
|-----|-----------|
| **quality** | `yarn install --frozen-lockfile`, `yarn run check`, `yarn build && yarn verify:dist`, `yarn smoke:http` em branches `main`, `master`, `develop` e em PRs. |
| **database** | Sobe **MySQL 8** como serviço e roda `yarn db:bootstrap` (migrations + seeds) para validar o pipeline de banco. |

**CD opcional:** existe o workflow [`.github/workflows/deploy-aws.yml`](.github/workflows/deploy-aws.yml) (manual em **Actions**), que roda os scripts de ECR + ECS. Configure secrets/variáveis conforme [`docs/deployment/github-actions-aws.md`](docs/deployment/github-actions-aws.md). **Terraform** e **migrations** continuam fora desse fluxo por padrão (ver doc).

### 9.1 Habilitar CI no fork/cliente

- Ative **Actions** no repositório GitHub.
- Os jobs usam apenas **secrets simulados** no YAML (`JWT_*` fixos para teste) — não precisam de secrets de AWS para o CI atual.

### 9.2 Opcional — CD com GitHub Actions (orientação)

Para publicar a cada tag ou push em `main`, uma abordagem comum é:

1. Configurar **OIDC** com role IAM e o secret `AWS_ROLE_TO_ASSUME` (recomendado); ver [`docs/deployment/github-oidc-aws.md`](docs/deployment/github-oidc-aws.md). Evite access keys de longa duração no GitHub.
2. Workflow com passos: `aws ecr get-login-password`, `docker build/push`, `aws ecs update-service --force-new-deployment` ou `terraform apply` com backend remoto (S3 + DynamoDB lock).

Mantenha **Terraform state** fora do git (backend S3) se várias pessoas forem aplicar infra.

---

## 10. Referências úteis

| Documento | Conteúdo |
|-----------|----------|
| [`docs/deployment/README.md`](docs/deployment/README.md) | Índice de deploy, variáveis, secrets, S3, Aurora, Fase 3 ECS |
| [`infra/aws/README.md`](infra/aws/README.md) | Ordem dos stacks Terraform |
| [`infra/aws/foundation/README.md`](infra/aws/foundation/README.md) | Foundation em detalhe |
| [`infra/aws/s3-phase1/README.md`](infra/aws/s3-phase1/README.md) | Bucket de mídia |

---

## 11. Resumo do fluxo “conta AWS nova”

1. `aws configure` + IAM com permissões suficientes  
2. `infra/aws/s3-phase1` → `apply` → copiar `bucket_name` e `s3_public_base_url`  
3. `infra/aws/foundation` → preencher `terraform.tfvars` → `apply`  
4. `corepack enable` && `yarn install --frozen-lockfile` && `yarn build` → `./scripts/ecr-build-push.sh`  
5. Ajustar `container_image` / porta / health no `terraform.tfvars` → `terraform apply`  
6. Migrations com acesso à VPC  
7. `yarn smoke:alb` com `SMOKE_BASE_URL` do output do ALB  

Com isso, quem clonar o projeto consegue **reproduzir o ambiente**, **alterar código**, **republicar imagens** e **evoluir a infra** seguindo a mesma sequência.
