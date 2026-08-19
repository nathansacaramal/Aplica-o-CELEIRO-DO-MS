# Fase 3 — Publicação no ECS Fargate (ALB, ECR, S3, Aurora/RDS)

Escopo **somente Fase 3**: containerizar a API Node/Express, publicar no **ECS Fargate** atrás de **ALB**, conectar **S3** (mídia) e **MySQL** (**RDS gerenciado pelo foundation** ou **Aurora** da Fase 2), variáveis/segredos, fluxo mínimo de deploy, health/readiness, smoke tests e checklist operacional.

Arquitetura de código: `core` + módulos; Sequelize; padrão já documentado em [environment-variables.md](./environment-variables.md) e [pre-implementacao-e-deploy.md](./pre-implementacao-e-deploy.md).

---

## 1. Arquitetura mínima de publicação

```text
Internet ──► ALB (HTTP/HTTPS) ──► Target Group ──► ECS Fargate
                              │                        • Lab: subnet pública + IP público
                              │                        • Prod: subnet privada + NAT
                              ├── Secrets Manager (JWT_*, DB_PASSWORD)
                              ├── CloudWatch Logs (/ecs/...)
                              ├── (opcional) WAFv2 regional
                              └── Task role IAM ──► S3 (bucket Fase 1, prefixo configurável)

Task (mesma VPC) ──► MySQL :3306
                    • RDS MySQL (foundation, use_managed_rds=true), ou
                    • Aurora writer endpoint (use_managed_rds=false + aurora-phase2)
```

- **Lab (padrão Terraform):** sem NAT — subnets **públicas** + `assign_public_ip` na task.
- **Produção:** `nat_gateway_enabled = true` — tasks em subnets **privadas** (as mesmas do RDS), egress via **NAT** (1 NAT = custo menor; uma AZ de egress — para HA use um NAT por AZ).
- **HTTPS:** `acm_certificate_arn` (mesma região do ALB) → listener **443** + **redirect 301** de **80** para **443**. Output `alb_public_base_url` reflete `https://` ou `http://`.
- **TLS ao banco**: `DB_SSL=true` + `DB_SSL_REJECT_UNAUTHORIZED=true`; a imagem inclui `certs/` em `/app/certs/` (referência). **Sem** `DB_SSL_CA_PATH` na task, o mysql2 usa o bundle embutido **Amazon RDS**.

---

## 2. Containerização (arquivos no repositório)

| Arquivo | Função |
|---------|--------|
| `Dockerfile` | Multi-stage: build TypeScript, runner `node:22-bookworm-slim`, usuário não-root, `certs/`, `database/`, `.sequelizerc`, `scripts/sequelize-with-node-env.cjs` (migrate/seed na VPC), `PORT=3000`, `HEALTHCHECK` em `/health`. |
| `.dockerignore` | Reduz contexto de build (sem `node_modules`, `dist`, `.env`, etc.). |

Validação local:

```bash
docker build -t catalogo-eventos-api:local .
docker run --rm -p 3000:3000 -e READINESS_CHECK_DB=false catalogo-eventos-api:local
# outro terminal: curl -s http://127.0.0.1:3000/health
```

---

## 3. Infraestrutura Terraform (`infra/aws/foundation`)

Já prevê: VPC, subnets públicas e privadas, **ECR**, **ALB** (`drop_invalid_header_fields`), **ECS**, **Secrets Manager**, **task role** S3, SGs (ALB → tasks → RDS/Aurora). Opcionais: **NAT**, **HTTPS (ACM)**, **RDS endurecido**, **Container Insights**, **retention de logs**, **autoscaling** CPU, **alarmes CloudWatch**, **WAF**.

Referência de valores: [`infra/aws/foundation/terraform.tfvars.production.example`](../../infra/aws/foundation/terraform.tfvars.production.example).

- **RDS MySQL** opcional: `use_managed_rds = true` (padrão) cria instância e injeta host/senha no segredo.
- **Aurora (Fase 2)**: `use_managed_rds = false`, `external_db_host` = writer endpoint, `external_db_password` = mesma senha que a aplicação usará (ex.: master do cluster). Ajuste `db_name` / `db_username` para bater com o Aurora. No módulo **aurora-phase2**, inclua em `allowed_security_group_ids` o output **`ecs_tasks_security_group_id`** do foundation (ingress :3306).

Variáveis críticas para a **imagem real da API**:

- `container_image` — URI ECR + tag (após push).
- `container_port = 3000`
- `health_check_path = "/health"` (target group + health do serviço).

Detalhes: [infra/aws/foundation/README.md](../../infra/aws/foundation/README.md).

### HTTPS no ALB (certificado ACM)

Sem `acm_certificate_arn` no `terraform.tfvars`, o ALB **só escuta na porta 80**. Chamadas a `https://<dns-do-alb>` na **443** ficam em **timeout** (nada ouvindo na 443, SG sem ingress 443).

1. No **ACM** (mesma região do ALB, ex.: `us-east-1`), **solicite um certificado** para o hostname que o front e o browser vão usar (ex.: `api.seudominio.com.br`). Validação **DNS** (recomendada) ou email.
2. No **DNS** (Route 53 ou provedor), crie um registro **CNAME** desse hostname apontando para o **DNS name** do ALB (output `alb_dns_name`).
3. Defina no `terraform.tfvars`: `acm_certificate_arn = "arn:aws:acm:..."` e rode `terraform apply`.
4. O Terraform passa a criar: listener **HTTPS 443**, regra de **ingress 443** no SG do ALB, e **redirect 301** de **HTTP 80 → HTTPS 443** (`infra/aws/foundation/alb.tf`). A task ECS recebe `FORCE_HTTPS_REDIRECT=true` para reforço na app (`X-Forwarded-Proto: http` → 301 para `https://`).

**Nota:** você **não** consegue emitir um certificado ACM público válido só para o hostname padrão `*.elb.amazonaws.com` do ALB; use um **domínio seu** (CNAME → ALB).

---

## 4. Variáveis, segredos e conectividade

| Origem | Conteúdo |
|--------|----------|
| **Secrets Manager** (`${project}-${env}/app/runtime`) | `JWT_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DB_PASSWORD`, `ADMIN_PASSWORD` |
| **Task definition (environment)** | `DB_*`, `MEDIA_STORAGE=s3`, `S3_*`, `AWS_REGION`, `PORT`, `READINESS_CHECK_DB`, `ADMIN_EMAIL`, `FORCE_HTTPS_REDIRECT` (true quando `acm_certificate_arn` definido), etc. |

Conectividade:

- ALB → SG das tasks na porta do container.
- Tasks → SG do RDS/Aurora na **3306** (regra no SG do banco apontando para SG das tasks ou CIDR controlado).
- S3: IAM da **task role** (não confundir com o usuário que roda `terraform`).

---

## 5. Forma mais simples e segura para esta primeira versão

1. Concluir **Fase 1 (S3)** e **Fase 2 (Aurora)** se for usar Aurora; ou usar **RDS do foundation**.
2. `terraform apply` no **foundation** com imagem **placeholder** (ex. nginx) só para validar ALB/ECS, **ou** já com imagem da API se o ECR já existir.
3. Build e push da API:

```bash
export AWS_REGION=us-east-1
export ECR_REPOSITORY_URL="$(cd infra/aws/foundation && terraform output -raw ecr_repository_url)"
./scripts/ecr-build-push.sh
```

4. Atualizar `terraform.tfvars`: `container_image`, `container_port = 3000`, `health_check_path = "/health"`, depois `terraform apply`.
5. Rodar **migrations** por um caminho com rota à VPC (bastion, CI na VPC, ou task one-off) — o RDS não é exposto publicamente por padrão.
6. Smoke no ALB:

```bash
export SMOKE_BASE_URL="$(cd infra/aws/foundation && terraform output -raw alb_public_base_url)"
npm run smoke:alb
```

Se `/ready` falhar por timeout de rede ao DB, corrija SG/rota; temporariamente pode usar `SMOKE_SKIP_READY=true` só para validar ALB + liveness.

Deploy de **nova imagem** sem mudar Terraform:

```bash
export ECS_CLUSTER_NAME="$(terraform output -raw ecs_cluster_name)"
export ECS_SERVICE_NAME="$(terraform output -raw ecs_service_name)"
./scripts/ecs-force-new-deployment.sh
```

(Confira nomes exatos com `terraform output` no diretório foundation.)

---

## 6. Como validar se a API subiu corretamente

1. **ECS**: serviço com **desired = running**, deployments estáveis, sem tasks parando em loop.
2. **Target group**: targets **healthy** (health check HTTP no path configurado).
3. **Logs**: CloudWatch log group `/ecs/<nome>` com stdout da aplicação sem erro fatal na subida.
4. **HTTP**: `curl -sS "http://<alb_dns>/health"` → JSON com `"status":"ok"`.
5. **Banco**: `curl -sS "http://<alb_dns>/ready"` → `"status":"ready"` (Sequelize `authenticate()`), desde que `READINESS_CHECK_DB=true` e rede/SG corretos.

---

## 7. Smoke tests e health check

| Verificação | Onde |
|-------------|------|
| **Liveness** | `GET /health` — não depende do banco. |
| **Readiness** | `GET /ready` — opcionalmente desliga com `READINESS_CHECK_DB=false` (não recomendado em produção). |
| **Docker** | `HEALTHCHECK` na imagem chama `/health` em `localhost`. |
| **ALB** | Target group health check deve usar o mesmo path/porta que o container expõe. |
| **CI / pós-deploy** | `npm run smoke:alb` com `SMOKE_BASE_URL`; script em `scripts/smoke-alb.cjs`. |

Smoke local (sem ALB): `npm run smoke:http` (conforme documentação existente).

---

## 8. Checklist final da publicação

- [ ] `terraform.tfvars` preenchido (S3, JWT, imagem, porta 3000, `/health`).
- [ ] Aurora: `use_managed_rds=false`, host/senha/usuário/db alinhados; SG do cluster permite **ECS tasks SG** na 3306.
- [ ] Imagem buildada e **pushed** para o ECR da stack.
- [ ] `terraform apply` sem erros; task definition revisão nova.
- [ ] Target group com targets healthy.
- [ ] Migrations aplicadas no banco acessível pela VPC.
- [ ] `GET /health` e `GET /ready` OK pelo DNS do ALB.
- [ ] Upload/download de mídia via API validado em ambiente de teste (task role S3).
- [ ] Swagger desabilitado em produção (`SWAGGER_ENABLED=false` no Terraform).

---

## Riscos operacionais

- **Tasks em subnet pública** com IP público aumentam superfície; aceitável em lab, não ideal para produção.
- **HTTP no ALB** (sem ACM): tráfego em claro até o load balancer.
- **Segredo com `recovery_window_in_days = 0`**: destruição imediata — ajustar antes de produção.
- **Sem auto scaling / multi-AZ mínimo**: indisponibilidade se AZ ou task falhar (depende do `desired_count`).
- **Credenciais**: vazamento de `terraform.tfvars` ou senha master do banco compromete tudo o que compartilha o segredo.

---

## Rollback da Fase 3

1. **Só aplicação**: reverter para tag anterior no ECR + `terraform apply` com `container_image:tag` antigo **ou** `update-service --force-new-deployment` se a task definition já apontava para a tag móvel `latest` e você repush da imagem antiga (preferir tags imutáveis em produção).
2. **Infra**: `terraform plan` para versão anterior do estado (Git) e `apply` controlado; em último caso `terraform destroy` no foundation (destrói RDS se gerenciado — backup antes).

---

## O que ainda falta para produção mais robusta

Com as variáveis de endurecimento do foundation, **HTTPS, NAT/tasks privadas, WAF opcional, alarmes e autoscaling** passam a ser configuráveis. Ainda recomenda-se evoluir para:

- **VPC endpoints** (ECR, Logs, Secrets, S3) para reduzir dependência de NAT e tráfego pela internet.
- **RDS Proxy** ou pooler para escalar conexões ao Aurora/RDS.
- Rotação automática de segredos e políticas IAM mais restritivas na task.
- **Multi-AZ no ALB** já existe com 2 subnets públicas; elevar **desired_count** e NAT **por AZ** para HA de egress.
- Pipeline CI/CD com scan de imagem e deploy canário/blue-green.

---

## Próximos endurecimentos recomendados (ordem sugerida)

1. Preencher **`terraform.tfvars.production.example`** (ACM, NAT, RDS, alarmes SNS).
2. VPC endpoints para ECR/S3/Secrets/Logs (reduzir superfície e custo de transferência vs NAT).
3. Tags imutáveis no ECR e deploy por digest/revisão.
4. Teste periódico de restore a partir de snapshot RDS.
5. Domínio próprio (Route 53) apontando para o ALB, se ainda estiver só no DNS do load balancer.

---

## Referências no repositório

- [infra/aws/foundation/README.md](../../infra/aws/foundation/README.md)
- [infra/aws/README.md](../../infra/aws/README.md)
- [s3-phase1.md](./s3-phase1.md), [aurora-phase2.md](./aurora-phase2.md)
- Scripts: `scripts/ecr-build-push.sh`, `scripts/ecs-force-new-deployment.sh`, `scripts/smoke-alb.cjs`
