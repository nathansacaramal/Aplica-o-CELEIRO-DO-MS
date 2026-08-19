# Handover ao cliente — resumo executivo

Este documento descreve **como transferir** o projeto **código + pipeline + padrão de infra** para **repositório GitHub do cliente** e **conta AWS do cliente**, com base no estado atual do repositório.

## Leituras obrigatórias após este arquivo

1. [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) — execução passo a passo  
2. [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) — preenchimento do GitHub  
3. [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) — escopo Terraform vs manual  

## O que está sendo “entregue”

| Artefato | Observação |
|----------|------------|
| Código da API (Node/TypeScript) | Sem segredos commitados; `.env` / `terraform.tfvars` fora do Git |
| Infra como código | Pastas `infra/aws/*` (vários stacks Terraform independentes) |
| CI/CD | `.github/workflows/ci.yml`, `deploy-aws.yml` |
| Documentação | `docs/` (este índice: [index.md](./index.md)) |

## Transferência do repositório Git — viável?

**Sim**, com ressalvas auditáveis:

| Passo | Viável? | Notas |
|-------|---------|--------|
| ZIP / export do código → novo repo | Sim | Preferir `git clone` + push para preservar histórico e `.git` |
| Novo GitHub na org do cliente | Sim | Ajustar **branch padrão** e proteções conforme política do cliente |
| Secrets e Variables no novo repo | Sim | Nomes **fixos** documentados em [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) |
| Rodar workflow **Deploy AWS** | Sim | Exige **AWS já provisionada** (Terraform local/CI) + **OIDC** + secrets preenchidos |
| “Funcionar igual” sem reconfigurar nada | **Não** | Nada aponta magicamente para a conta do cliente: **toda** AWS é nova ou reimportada |

## Transferência da AWS — viável?

**Sim**: o cliente executa Terraform **na própria conta**, com **novos** `terraform.tfvars` e (recomendado) **novo** backend de state (`terraform-remote-state`).

**Não transferível como “copiar e colar”:**

- ARNs, IDs de conta, nomes de bucket com sufixo aleatório, DNS do ALB, certificados ACM  
- State files (devem residir no backend S3 **do cliente** após migração ou novo apply)  
- Segredos (JWT, senhas) — recriados no Secrets Manager **do cliente** pelo `foundation` + GitHub Secrets  

## Riscos principais

1. **State vazio vs infra já existente** — CI com `terraform plan` contra state vazio mostra “tudo a criar”; **apply** na conta errada ou duplicada gera conflito. Mitigação: um único backend de state por ambiente e [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md).  
2. **Trust OIDC** — `sub` do token deve bater com `repo:ORG/REPO:*` (ou padrão mais restrito). Mitigação: [github-oidc-aws.md](./deployment/github-oidc-aws.md) ou módulo [github-oidc-iam](../infra/aws/github-oidc-iam/README.md).  
3. **Domínio / ACM / DNS** — continuam **fora** do caminho mínimo automatizado; TLS e CNAME do ALB são manuais ou processo próprio do cliente.  
4. **Migrações de banco** — o runner do GitHub **não** acessa RDS na VPC por padrão; usar ECS one-off / bastion (ver [database-migrations.md](./deployment/database-migrations.md)).  

## Automação adicionada para reduzir console AWS

- **`infra/aws/github-oidc-iam/`** — opcional: OIDC provider + role + `ReadOnlyAccess` + lock DynamoDB + (opcional) ECR/ECS, via Terraform.  
- **`infra/aws/terraform-remote-state/`** — bucket S3 + tabela DynamoDB para state.  

## Veredito de prontidão

Ver seção **“Veredito final”** na resposta de entrega do arquiteto e [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) § Validação.

**Em uma frase:** o projeto é **transferível e reproduzível** desde que o cliente execute **Terraform na conta dele**, configure **GitHub Secrets/Variables** conforme a lista oficial, e aceite etapas **manuais** para DNS/ACM e políticas organizacionais (SCPs).
