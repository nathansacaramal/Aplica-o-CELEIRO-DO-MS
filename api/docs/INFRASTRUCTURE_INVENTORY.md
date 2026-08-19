# Inventário de infraestrutura — Terraform vs manual

Baseado nos arquivos `.tf` em `infra/aws/` neste repositório. **Condicional** = recurso criado só se variável/feature correspondente estiver ativa (ex.: NAT, WAF, API Gateway).

---

## 2.1 Criado automaticamente via Terraform

### `infra/aws/terraform-remote-state`

| Recurso | Descrição |
|---------|-----------|
| S3 bucket + versioning + encryption + public access block + policy TLS | Backend de **state** Terraform |
| DynamoDB table (opcional) | Lock de state |

### `infra/aws/s3-phase1`

| Recurso | Descrição |
|---------|-----------|
| S3 bucket mídia (sufixo aleatório) | Armazenamento de objetos da aplicação |
| Versioning, SSE, public access block, bucket policy, CORS | Controle de acesso ao prefixo público |
| IAM policy `app_media` | Leitura/escrita mínima para app / dev user opcional |

### `infra/aws/foundation`

| Área | Recursos (resumo) |
|------|-------------------|
| **Rede** | VPC, IGW, subnets públicas/privadas, route tables, associações, rotas; **NAT + EIP + rota privada** se `nat_gateway_enabled` |
| **Dados** | `data.aws_availability_zones`, `data.aws_s3_bucket.media` (bucket já existente da Fase 1) |
| **Compute / orquestração** | ECS cluster, task definition, service Fargate; **autoscaling** alvo CPU se habilitado |
| **Registry** | ECR repository API |
| **Balanceador** | ALB, target group, listeners HTTP/HTTPS (HTTPS se ACM); **WAFv2** associado se `enable_waf` |
| **API front** | API Gateway HTTP API + integrações/routes/stage se `enable_apigatewayv2_alb_proxy` |
| **Banco** | RDS MySQL (subnet group, SG, instance) se `use_managed_rds`; senão usa host externo |
| **Segredos** | Secrets Manager secret + versão inicial (runtime app) |
| **IAM** | Roles/policies execution + task (S3, Secrets); attachments gerenciados |
| **Logs / observabilidade** | CloudWatch log group ECS; **metric alarms** ALB/TG se `enable_cloudwatch_alarms` |
| **Aleatório** | `random_password` master DB quando RDS gerenciado |

### `infra/aws/aurora-phase2` (stack opcional)

| Recurso | Descrição |
|---------|-----------|
| Aurora MySQL cluster + instância writer | Subnet group, SG, Secrets Manager para credenciais |
| `data.aws_rds_engine_version` | Versão de engine |

### `infra/aws/github-oidc-iam` (stack opcional — automação de CI)

| Recurso | Descrição |
|---------|-----------|
| IAM OIDC provider GitHub | Se `create_oidc_provider = true` |
| IAM role + trust `repo:ORG/REPO:*` (ou padrão custom) | Assumida pelo GitHub Actions |
| Attachment `ReadOnlyAccess` | Opcional; para `terraform plan` |
| Inline policies | Lock DynamoDB; ECR+ECS deploy se variáveis preenchidas |

---

## 2.2 Manual ou fora do Terraform deste repo

| Item | Por que manual / externo |
|------|-------------------------|
| **Conta AWS, billing, organização** | Terraform não cria conta |
| **Usuário/role do operador** que roda `terraform apply` | Credenciais locais ou CI fora deste workflow |
| **GitHub** org, repo, branch, **Secrets/Variables** | Plataforma GitHub |
| **Certificado ACM + validação DNS/email** | Requer domínio e DNS do cliente; ARN passado em variável |
| **DNS público** (CNAME/ALIAS para ALB ou API GW) | Provedor DNS do cliente |
| **Thumbprints OIDC** (se política corporativa exigir conferência manual) | Atualização rara; módulo `github-oidc-iam` fixa lista padrão |
| **SCPs / permission boundaries** na org AWS | Política corporativa |
| **Imagens Docker** no ECR | Build/push feito pelo workflow ou localmente (Terraform só cria o repositório) |
| **Migrações Sequelize na VPC** | Runner GitHub sem VPC; usar ECS task, bastion ou script documentado |
| **Decisão de state**: migrar `terraform.tfstate` local → S3 | Comando `terraform init -migrate-state` na máquina do operador |
| **Segredos reais** em `terraform.tfvars` / GitHub Secrets | Nunca commitados no Git |
| **Aprovações humanas** de deploy em produção | Environments GitHub, change management |

---

## Acoplamentos a “sua” conta atual (o que o cliente deve trocar)

- Qualquer **ARN, account ID, bucket name com sufixo**, **URL do ALB** em documentação de exemplo.  
- **Trust OIDC** deve usar `repo:CLIENT_ORG/CLIENT_REPO:...`.  
- **Backend S3** do state deve ser **bucket na conta do cliente**.  

Não há no código **account ID fixo** obrigatório nos `.tf` analisados (valores vêm de `data.aws_caller_identity` ou variáveis).

---

## Links

- [docs/index.md](./index.md)  
- [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)  
- [foundation/README.md](../infra/aws/foundation/README.md)  
