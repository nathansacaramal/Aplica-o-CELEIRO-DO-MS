# Guia de operação (dia 2)

Para quem **não** participou do desenvolvimento inicial: manter a API no ar, atualizar imagem, planear infra e recuperar de falhas.

## Rotinas

### Publicar nova versão da API (somente aplicação)

1. Merge na branch permitida pelo OIDC (ex.: `main`).  
2. **Actions** → **Deploy AWS (ECR + ECS)** → *Run workflow*.  
3. Opcional: `image_tag` (ex. SHA ou `latest`).  
4. Confirmar logs: build → push ECR → `UpdateService`.  
5. Se `SMOKE_BASE_URL` configurada: aguardar smoke `/health` (e `/ready` se não pular).  

**Documentação:** [deployment/github-actions-aws.md](./deployment/github-actions-aws.md), [phase3-ecs-publish.md](./deployment/phase3-ecs-publish.md).

### Alterar infraestrutura (Terraform)

- **Produção:** `terraform plan` revisado por humano → `apply` em ambiente controlado (máquina com credenciais ou pipeline dedicado).  
- **CI:** job opcional **Terraform plan** no mesmo workflow de deploy — **não aplica** mudanças.  

**Documentação:** [foundation/README.md](../infra/aws/foundation/README.md), [github-actions-aws.md](./deployment/github-actions-aws.md) (job plan).

### Banco de dados

- **Migrations:** não fazem parte do `deploy-aws.yml` padrão — ver [database-migrations.md](./deployment/database-migrations.md).  
- **Secrets:** rotação em Secrets Manager alinhada a [secrets-jwt-fargate.md](./deployment/secrets-jwt-fargate.md).  

### Observabilidade

- Logs: CloudWatch log group criado pelo `foundation` para tasks ECS.  
- Alarmes: opcionais via variáveis `enable_cloudwatch_alarms`, `alarm_sns_topic_arn`.  

## Smoke e saúde

| Endpoint | Uso |
|----------|-----|
| `GET /health` | Liveness (sem DB) |
| `GET /ready` | Readiness com DB; desligável via env na task |

Local: `yarn smoke:alb` com `SMOKE_BASE_URL` — [phase3-ecs-publish.md](./deployment/phase3-ecs-publish.md).

## Incidentes e rollback

| Cenário | Ação sugerida |
|---------|----------------|
| Deploy quebrou a API | Rodar workflow com imagem/tag anterior ainda presente no ECR; ou reverter Git e redeployar |
| Task não sobe | Console ECS → eventos do serviço; logs CloudWatch; SG / imagem / secrets |
| Plan mostra drift | Investigar mudança manual na console vs state; corrigir com Terraform ou refresh |
| State corrompido / lock | Ver lock DynamoDB; [terraform-remote-state README](../infra/aws/terraform-remote-state/README.md) |

## Contactos úteis no repositório

- [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) — nomes GitHub  
- [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) — o que existe na AWS  
- [index.md](./index.md) — mapa da documentação  
