# Resumo executivo — entrega e posse (handover)

Documento em linguagem direta para **decisores e responsáveis técnicos** do cliente. O detalhe operacional está em [index.md](./index.md), [CLIENT_HANDOVER.md](./CLIENT_HANDOVER.md) e [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md).

---

## O que foi entregue

| Entregável | Descrição |
|------------|-----------|
| **API** | Serviço Node.js/TypeScript modular, com testes, Docker e documentação de API (Swagger). |
| **Infraestrutura como código** | Terraform em `infra/aws/`: stacks separados para state remoto, bucket de mídia (S3), núcleo AWS (rede, banco, ECS, ALB, ECR, segredos, etc.), Aurora opcional, e módulo opcional para IAM/OIDC do GitHub. |
| **CI/CD** | GitHub Actions: qualidade no `ci.yml` e deploy (`build` → ECR → nova revisão no ECS) no `deploy-aws.yml`, com opção de `terraform plan` em paralelo. |
| **Documentação** | Índice em [index.md](./index.md), checklist de deploy, inventário de infra, lista de secrets/variables, guia de operação e guia OIDC/manual ou Terraform. |

Não faz parte da “entrega de código”: **conta AWS do cliente**, **repositório GitHub do cliente**, **domínio/DNS**, **certificados** já emitidos na conta do cliente, nem **dados** ou **state** da sua conta atual — isso o cliente recria ou migra de forma consciente.

---

## Como o cliente assume a posse

1. **Repositório** — Criar o repo na organização do cliente, enviar o código (idealmente com histórico Git, não só ZIP).  
2. **Conta AWS** — Usar **a própria conta** do cliente; executar Terraform **lá**, com `terraform.tfvars` e backend de state **no ambiente do cliente**.  
3. **GitHub** — Preencher **Secrets** e **Variables** conforme [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) (principalmente role OIDC, ECR, ECS, região e, se usar plan no CI, state + mídia + JWT).  
4. **Ordem de trabalho** — Seguir [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) (state → S3 mídia → foundation → opcional OIDC via Terraform → primeiro pipeline).  
5. **Validação** — Workflow de deploy concluído com sucesso e `GET /health` (e demais checks acordados) na URL pública.

A “posse” significa: **código + pipelines + runbooks** sob controle do cliente; **custo, billing, suporte AWS e acesso IAM** ficam com o cliente.

---

## O que está automatizado

- **Provisionamento** da maior parte da infraestrutura descrita nos módulos Terraform (VPC, ECS Fargate, ALB, ECR, RDS ou caminho Aurora, S3 de mídia, Secrets Manager para runtime, IAM das tasks, logs, recursos opcionais como WAF/API Gateway/NAT conforme variáveis).  
- **Backend de state** dedicado (bucket S3 + tabela DynamoDB de lock) via módulo `terraform-remote-state`, se adotado.  
- **Role e OIDC para GitHub** podem ser criados por Terraform (`github-oidc-iam`), reduzindo configuração manual no console IAM.  
- **Pipeline de aplicação**: build da imagem, push no ECR e atualização do serviço ECS ao disparar o workflow.

---

## O que exige configuração manual

- **Conta AWS e identidade** que executa `terraform apply` (usuário ou role com permissões adequadas).  
- **GitHub**: criação do repositório, secrets, variables, políticas de branch/environments, se aplicável.  
- **Trust OIDC** alinhado ao repo real do cliente (`repo:ORG/REPO/...`).  
- **Certificado ACM e DNS** para HTTPS com domínio próprio (emissão/validação e apontamentos).  
- **Valores secretos**: JWT, senhas, conteúdo inicial de segredos — sempre fora do Git (Secrets Manager + GitHub Secrets / tfvars locais ignorados).  
- **Migrações de banco** na VPC (o runner padrão não fica na VPC; usar task ECS, bastion ou processo documentado).  
- **Migração de state**, se já existia infra aplicada só com state local: alinhar backend S3 e estado com a realidade da conta.

---

## Riscos

| Risco | Comentário |
|-------|------------|
| **State inconsistente** | Plan no CI contra state vazio ou errado pode sugerir “criar tudo de novo” e gerar conflito com recursos já existentes. Mitigação: um backend de state por ambiente e checklist de migração. |
| **OIDC / trust incorreto** | Workflow falha ao assumir role ou a AWS nega chamadas. Mitigação: conferir `sub` do repositório e política da role. |
| **Permissões IAM** | Role mínima só para ECR/ECS quebra o job de `terraform plan`; é necessário leitura ampla (ex.: `ReadOnlyAccess`) + lock DynamoDB, conforme documentação OIDC. |
| **TLS e DNS** | Sem ACM/DNS corretos, o usuário final pode ver erro de certificado ou indisponibilidade em HTTPS. |
| **Dependência de pessoas** | Segredos e aprovações de produção não devem depender de uma única pessoa; usar cofre e processos do cliente. |

---

## Recomendações futuras

1. **Ambientes** — Separar dev/staging/prod com **workspaces Terraform** ou **prefixos de state** distintos e **GitHub Environments** com aprovação em produção.  
2. **Endurecer IAM** — Depois do go-live, substituir `ReadOnlyAccess` da role de CI por políticas **somente leitura** nos ARNs dos recursos do projeto, se a política de segurança do cliente exigir.  
3. **Observabilidade** — Revisar alarmes CloudWatch, SNS e, se necessário, APM/log aggregation alinhados ao SLA.  
4. **Backup e DR** — Política de backup RDS, retenção e teste de restauração documentados com o negócio.  
5. **Renovação de certificados e thumbprints OIDC** — Incluir no calendário operacional revisões anuais ou conforme avisos da AWS/GitHub.  
6. **Manutenção da documentação** — Ao mudar workflows ou stacks Terraform, atualizar [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) e [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md).

---

## Onde aprofundar

| Tema | Documento |
|------|-----------|
| Passo a passo completo | [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) |
| Secrets e variables do GitHub | [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) |
| O que o Terraform cria | [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) |
| Dia a dia e incidentes | [OPERATION_GUIDE.md](./OPERATION_GUIDE.md) |
| Visão de transferência | [CLIENT_HANDOVER.md](./CLIENT_HANDOVER.md) |
| Mapa geral | [index.md](./index.md) |
