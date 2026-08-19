# GitHub Actions → AWS com OIDC (sem access keys)

Este projeto usa **OpenID Connect** para que o GitHub Actions assuma uma **role IAM** temporária, sem `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` de longa duração.

Referências oficiais:

- [GitHub — Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS — Creating OpenID Connect (OIDC) identity providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)

---

**Automação (opcional):** o módulo Terraform [`infra/aws/github-oidc-iam/`](../../infra/aws/github-oidc-iam/README.md) cria o provedor OIDC (se ainda não existir), a role e anexos de política alinhados a esta página — útil em **handover** para reduzir trabalho manual no console.

---

## 1. Provedor OIDC no IAM (uma vez por conta AWS)

No **IAM** → **Identity providers** → **Add provider**:

| Campo | Valor |
|--------|--------|
| Provider type | OpenID Connect |
| Provider URL | `https://token.actions.githubusercontent.com` |
| Audience | `sts.amazonaws.com` |

A AWS valida o certificado do GitHub; se pedir **thumbprint**, use o procedimento da documentação AWS/GitHub acima (a lista de thumbprints pode mudar).

---

## 2. Role IAM para o workflow de deploy

### 2.1 Trust policy (substitua `OWNER` e `REPO`)

Anexe esta **custom trust policy** à role (ex.: `GitHubActionsCatalogoDeploy`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GitHubActionsOIDC",
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:*"
        }
      }
    }
  ]
}
```

- Troque **`ACCOUNT_ID`** pelo ID da conta AWS (12 dígitos).
- Troque **`OWNER/REPO`** (ex.: `JhonataProf/catalogo-eventos-api`).

**Restringir só à branch `main`:**

```json
"token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:ref:refs/heads/main"
```

**Só tags de release (exemplo):**

```json
"token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:ref:refs/tags/*"
```

Vários repositórios: use `StringLike` com várias chaves ou uma role por repo.

### 2.2 Permissões da role (mínimo para o deploy atual)

O job de deploy precisa de **ECR** (push), **ECS** (`UpdateService`, `Describe*`, wait estável) e, se usar smoke/wait, as mesmas chamadas de leitura.

Anexe uma política **custom** (ajuste ARNs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EcrPushApiImage",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EcrRepository",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Resource": "arn:aws:ecr:REGION:ACCOUNT_ID:repository/REPOSITORY_NAME"
    },
    {
      "Sid": "EcsDeploy",
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeClusters"
      ],
      "Resource": "*",
      "Condition": {
        "ArnEquals": {
          "ecs:cluster": "arn:aws:ecs:REGION:ACCOUNT_ID:cluster/CLUSTER_NAME"
        }
      }
    }
  ]
}
```

- `GetAuthorizationToken` em ECR costuma ser `Resource: *` (exigência da API).
- Restrinja o repositório ECR e o cluster ECS aos recursos reais (veja ARNs no console).
- Se usar o job **Terraform plan**, veja a seção **2.3** abaixo (a política mínima de ECR/ECS **não** basta).

### 2.3 Permissões extras para o job **Terraform plan (foundation)**

O `terraform plan` com backend S3 + DynamoDB lock:

1. **Lê** o state no S3 e usa **DynamoDB** para **lock** (`PutItem` / `GetItem` / `DeleteItem` na tabela de lock — isso **não** está em políticas só de leitura).
2. Durante o **refresh/plan**, o provider AWS chama dezenas de APIs **`Describe*` / `Get*`** (EC2, ELB, RDS, ECS, IAM, Secrets Manager, etc.). Sem isso aparecem erros como:
   - `UnauthorizedOperation` em `ec2:DescribeAvailabilityZones`
   - falha em `data "aws_s3_bucket" "media"` (bucket inexistente, região errada **ou** sem permissão de leitura no S3).

**Abordagem recomendada (simples e estável):** anexe à mesma role (ou a uma role dedicada só para o plan) a política gerenciada:

- **`ReadOnlyAccess`** (`arn:aws:iam::aws:policy/ReadOnlyAccess`)

E **adicione** uma política **custom** estreita para o **lock** do Terraform (substitua `REGION`, `ACCOUNT_ID`, `TABLE_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TerraformStateLockDynamoDb",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME"
    }
  ]
}
```

O valor de `TABLE_NAME` é o do GitHub **`TF_STATE_DYNAMODB_TABLE`** (output `terraform_state_lock_table_name` do módulo `infra/aws/terraform-remote-state`, se usar).

**Leitura do state no S3:** `ReadOnlyAccess` já cobre `s3:GetObject` / `ListBucket` para ler o objeto de state. Se a organização usar SCP que negue S3, inclua um statement explícito no bucket de state (`arn:aws:s3:::BUCKET` e `arn:aws:s3:::BUCKET/*`).

**Não quer usar `ReadOnlyAccess`?** Terá de ir ampliando permissões à medida que novos erros `403` aparecem (EC2, RDS, Elastic Load Balancing, ECS, IAM `GetRole`/`ListRolePolicies`, etc.). Para o módulo `foundation`, a lista fica longa; por isso o `ReadOnlyAccess` + DynamoDB lock é o padrão sugerido.

**Erro `reading S3 Bucket (...): empty result`:** além de IAM, confira se o bucket existe **na mesma conta** e **na mesma região** configurada em `AWS_REGION` / `TF_VAR_aws_region` e se o nome bate com o output do `s3-phase1` (`TF_MEDIA_BUCKET_NAME`).

---

## 3. Secret no GitHub

1. Copie o **ARN da role** (ex.: `arn:aws:iam::123456789012:role/GitHubActionsCatalogoDeploy`).
2. No repositório: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - Nome: **`AWS_ROLE_TO_ASSUME`**
   - Valor: o ARN da role.

3. Mantenha a variable **`AWS_REGION`** (ou secret) como hoje.

4. **Remova** (ou deixe de usar) `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` nos workflows que já migraram para OIDC.

---

## 4. Workflow neste repositório

O arquivo [`.github/workflows/deploy-aws.yml`](../../.github/workflows/deploy-aws.yml) está configurado com:

- `permissions: id-token: write` e `contents: read`
- `configure-aws-credentials` usando apenas `role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}`

O workflow **CI** (`.github/workflows/ci.yml`) **não** chama a AWS; não precisa de OIDC.

---

## 5. Erros comuns

| Sintoma | Causa provável |
|---------|----------------|
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | Trust policy: `sub` não bate com `owner/repo` ou branch/tag. |
| `Access denied` no ECR/ECS | Policy da role sem ARN correto ou sem permissão. |
| `ec2:DescribeAvailabilityZones` / `UnauthorizedOperation` no **Terraform plan** | Role só com ECR/ECS; falta leitura na conta — ver seção **2.3** (`ReadOnlyAccess` + DynamoDB lock). |
| `reading S3 Bucket (...): empty result` no **plan** | Bucket errado/inexistente, região diferente da role, ou IAM sem leitura S3 — ver **2.3**. |
| OIDC provider não encontrado | Provider URL/audience incorretos ou conta errada. |

Para depurar o `sub` real, use temporariamente um workflow que imprima `github.server_url` / contexto (sem expor segredos) ou consulte a [documentação do claim `sub`](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#understanding-the-oidc-token).
