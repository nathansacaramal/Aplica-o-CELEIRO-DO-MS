# Fase 2 — Aurora MySQL (sem proxy): arquitetura, lab e produção

Escopo **somente Fase 2**: cluster Aurora, rede, segurança, conexão local para validação, Sequelize, teste de leitura/escrita. **Sem** RDS Proxy, **sem** publicação completa da aplicação.

## 1. Arquitetura mínima

```text
                    ┌─────────────────────────────────────────┐
                    │  Aurora cluster (engine aurora-mysql 8)   │
                    │  1× cluster instance (writer)           │
                    │  endpoint direto :3306 (sem RDS Proxy)    │
                    └─────────────────────────────────────────┘
                                      ▲
          ┌───────────────────────────┼───────────────────────────┐
          │  Security Group           │                           │
          │  ingress :3306            │                           │
          │  ← CIDR lab (seu /32)     │  ← SG das tasks ECS (output foundation `ecs_tasks_security_group_id`) │
          └───────────────────────────┴───────────────────────────┘
                                      │
     ┌────────────────────────────────┴────────────────────────────────┐
     │  DB subnet group (≥2 AZ) — subnets públicas (lab) ou privadas   │
     └──────────────────────────────────────────────────────────────────┘
```

- **Secrets Manager**: JSON com `host`, `port`, `username`, `password`, `database` (gerado pelo Terraform em `infra/aws/aurora-phase2`).
- **Aplicação**: continua usando apenas `ENV` (`DB_*`) — **sem** acoplamento de domínio ao Terraform; Sequelize em `src/core/database.ts`.

## 2. Engine escolhida e justificativa

| Opção | Decisão |
|--------|---------|
| **Aurora MySQL (compatível com 8.0)** | **Sim** — mesmo protocolo e dialeto que o projeto já usa (`DB_DIALECT=mysql`, migrations Sequelize, `mysql2`). |
| Aurora PostgreSQL | Não nesta fase — exigiria trocar dialeto, tipos e migrations. |
| RDS MySQL “simples” (não Aurora) | Válido para custo mínimo; a Fase 2 pede **Aurora** explicitamente. |
| RDS Proxy | Fora do escopo (“sem proxy”); conexão direta ao **cluster endpoint** (writer). |

## 3. Infraestrutura (Terraform)

Diretório: **`infra/aws/aurora-phase2/`**

- `aws_rds_cluster` + `aws_rds_cluster_instance` (writer).
- `aws_db_subnet_group`, `aws_security_group`, Secrets Manager.
- Variáveis: `vpc_id`, `database_subnet_ids`, `allowed_cidr_blocks`, `allowed_security_group_ids`, `publicly_accessible` (lab).
- **ECS Fargate (Fase 3):** em `allowed_security_group_ids`, inclua o output Terraform **`ecs_tasks_security_group_id`** do stack `infra/aws/foundation` para liberar MySQL **3306** das tasks para o cluster Aurora.

**Obter `vpc_id` e subnets a partir do foundation (sem remote state):**

```bash
cd infra/aws/foundation
terraform output -raw vpc_id
terraform output -json private_subnet_ids   # Aurora em subnets privadas (recomendado)
# ou: terraform output -json public_subnet_ids  # lab + publicly_accessible
```

Se o Terraform responder que o **output não existe no state**, rode **`terraform apply` no foundation** após puxar o código que declara esses outputs (o apply pode não alterar recursos, só grava os outputs). Alternativa: `printf '%s\n' 'jsonencode(aws_subnet.private[*].id)' | terraform console` no diretório do foundation.

O stack `foundation` expõe `private_subnet_ids` e `public_subnet_ids` como outputs (lista de 2 subnets em AZs distintas).

**Automatizar com `terraform_remote_state`:** configure backend remoto (por exemplo S3) no `foundation` e no `aurora-phase2`, depois no Aurora:

```hcl
data "terraform_remote_state" "foundation" {
  backend = "s3"
  config = {
    bucket = "meu-terraform-state"
    key    = "foundation/terraform.tfstate"
    region = "us-east-1"
  }
}

# locals {
#   vpc_id              = data.terraform_remote_state.foundation.outputs.vpc_id
#   database_subnet_ids = data.terraform_remote_state.foundation.outputs.private_subnet_ids
# }
```

Use esses `locals` nas variáveis do módulo ou substitua referências em `terraform.tfvars` por `-var` / `TF_VAR_` gerados em pipeline.

Detalhes de comandos: [`infra/aws/aurora-phase2/README.md`](../../infra/aws/aurora-phase2/README.md).

## 4. Melhor forma de conectar localmente (validação)

| Modo | Quando usar | Observação |
|------|-------------|------------|
| **A** Subnets **públicas** + `publicly_accessible = true` + SG com **seu IP/32** | Laboratório rápido | Menos seguro; não usar em produção. |
| **B** Subnets **privadas** + **bastion** (SSM ou SSH) com port forwarding | Mais próximo de produção | Recomendado assim que sair do “primeiro teste”. |
| **C** **VPN** / **Client VPN** para a VPC | Equipes | Bom meio-termo. |

O projeto **não** implementa bastion/VPN no Terraform desta fase — apenas documenta o padrão.

**Descobrir seu IP público:** `curl -s https://checkip.amazonaws.com`

## 5. Sequelize e configuração da aplicação

Variáveis já existentes em `src/core/config/env.ts` (Zod):

- `DB_HOST` → endpoint **writer** do cluster (`terraform output cluster_endpoint`).
- `DB_PORT` → `3306` (padrão).
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` → alinhar ao secret ou ao que definiu no Terraform (`db_name`, `master_username`, senha gerada).
- **`DB_SSL=true`** para TLS até o endpoint Aurora (recomendado).
- **`DB_SSL_REJECT_UNAUTHORIZED`**: em laboratório, se o cliente não confiar no certificado sem CA bundle, use `false` **só temporariamente**; o ideal é **`DB_SSL_CA_PATH`** apontando para o bundle oficial da AWS (`global-bundle.pem`).

**Novo (opcional):** `DB_SSL_CA_PATH` — caminho absoluto ou relativo ao `cwd` do processo Node para o arquivo PEM da AWS; `database.ts` injeta `ssl.ca` no `dialectOptions` quando `DB_SSL` está ativo.

**Regra de negócio:** inalterada — apenas `core/config` e `core/database.ts` conhecem TLS; módulos continuam usando Sequelize injetado.

## 6. Teste real: conexão, leitura e escrita

Script **sem** subir o Express inteiro:

```bash
# .env com DB_* do Aurora + DB_SSL conforme acima
npm run verify:aurora-db
```

O script (`scripts/verify-aurora-db.cjs`):

1. Conecta com `mysql2` usando a mesma lógica SSL básica do `.env`.
2. `CREATE TABLE IF NOT EXISTS _aurora_smoke (...)`.
3. `INSERT` + `SELECT` da linha inserida.
4. `DROP TABLE _aurora_smoke`.

Validação adicional com a API: com migrations aplicadas, `GET /ready` com `READINESS_CHECK_DB=true` chama `sequelize.authenticate()`.

## 7. Comandos e checklist

### Comandos (resumo)

```bash
# 1) Infra
cd infra/aws/aurora-phase2
terraform init && terraform apply

# 2) Obter credenciais
aws secretsmanager get-secret-value --secret-id <arn_ou_nome> --query SecretString --output text

# 3) Baixar CA AWS (recomendado com DB_SSL_REJECT_UNAUTHORIZED=true)
curl -sS -o aws-global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# 4) .env (exemplo)
# DB_HOST=<cluster_endpoint>
# DB_SSL=true
# DB_SSL_CA_PATH=./aws-global-bundle.pem
# DB_SSL_REJECT_UNAUTHORIZED=true

# 5) Smoke
npm run verify:aurora-db

# 6) Migrations (mesmo host/usuário/senha)
npm run db:migrate
```

### Checklist de validação

- [ ] `terraform apply` OK; outputs `cluster_endpoint` e secret preenchidos.
- [ ] SG permite 3306 da origem usada (seu IP ou bastion).
- [ ] Se público: `publicly_accessible=true` e subnets corretas.
- [ ] `npm run verify:aurora-db` conclui sem erro.
- [ ] `npm run db:migrate` aplica schema sem erro.
- [ ] (Opcional) `npm run dev` + `GET /ready` retorna sucesso com DB.

---

## Riscos de segurança

- **3306 exposto na internet** (mesmo com /32): superfície de ataque se o IP mudar ou CIDR for amplo; credenciais vazadas têm impacto direto.
- **`publicly_accessible` + subnets públicas**: padrão fraco fora de lab.
- **`DB_SSL_REJECT_UNAUTHORIZED=false`**: vulnerável a MITM — só para depuração.
- **Secret em texto** no console/terminal — histórico de shell e logs.
- **`recovery_window_in_days = 0`** no secret Terraform: exclusão imediata do secret (adequado a lab).

## Aceitável só em laboratório

- Aurora em subnet pública, `publicly_accessible=true`, acesso por IP fixo de teste.
- `skip_final_snapshot = true`, `deletion_protection = false`, backup 1 dia.
- `recovery_window_in_days = 0` no Secrets Manager.
- `DB_SSL_REJECT_UNAUTHORIZED=false` enquanto valida conectividade (curto prazo).

## O que precisa mudar para produção

- Subnets **privadas**; **sem** `publicly_accessible` para dados.
- Acesso de app via **SG da task ECS** (`allowed_security_group_ids`), não CIDR público amplo.
- Considerar **RDS Proxy** em fase futura (pooling, IAM auth opcional) — fora do escopo Fase 2.
- **`deletion_protection = true`**, `skip_final_snapshot = false` + janela de backup, retention maior.
- Secrets com **recovery window**, rotação de senha, **KMS** dedicado se política exigir.
- **`DB_SSL=true`** + CA bundle + `DB_SSL_REJECT_UNAUTHORIZED=true`.
- Alarmes CloudWatch (conexões, CPU, storage, replicação), runbook.

## Rollback da fase

1. Ajustar `.env` de volta para banco local/outro alvo.
2. `terraform destroy` em `infra/aws/aurora-phase2` (pode falhar se houver snapshot obrigatório — ajuste variáveis conforme README do módulo).
3. Remover regras SG órfãs manualmente se tiver criado recursos fora do Terraform.

## O que ainda falta antes de “publicação”

- Pipeline que rode **`db:migrate`** com rede na VPC (ou task one-off).
- Imagem da API no ECR + serviço ECS apontando para **este** endpoint (ou Proxy futuro).
- HTTPS no ALB, WAF se necessário.
- Revisão de **max_connections** (Aurora × número de tasks × pool Sequelize).
- Testes de carga mínimos e plano de custo (Aurora + tráfego).
