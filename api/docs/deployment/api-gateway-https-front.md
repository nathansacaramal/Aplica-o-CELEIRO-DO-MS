# API Gateway HTTP API na frente do ALB — HTTPS sem domínio próprio

Este documento responde ao desenho **SRE/DevOps**: expor a API em **HTTPS** usando o domínio padrão da AWS (`*.execute-api.*.amazonaws.com`), sem certificado ACM em domínio que você possua e com infraestrutura em **Terraform**.

---

## 1. Diagnóstico da arquitetura atual

- **ALB público** em subnets públicas, listener **HTTP:80** encaminhando ao target group (ECS Fargate).
- **HTTPS direto no ALB (443)** exige **ACM** com nome validado no DNS — em geral **domínio próprio** (ou processo de validação que você controla).
- O hostname **padrão do ALB** (`xxx.elb.amazonaws.com`) **não** recebe certificado público ACM “automático” da forma que o navegador confia sem esse processo de validação.
- Resultado: o front precisa de **outra camada** com TLS gerenciado pela AWS **sem** comprar domínio para a API.

---

## 2. Arquitetura recomendada

```
Cliente (HTTPS) → API Gateway HTTP API (*.execute-api.*.amazonaws.com)
                     │  TLS gerenciado pela AWS
                     ▼ (HTTP interno na internet pública)
                 ALB :80 → ECS (app Node)
```

- **API Gateway HTTP API (v2)** expõe **HTTPS** no endpoint regional `https://{api-id}.execute-api.{region}.amazonaws.com`.
- Integração **HTTP_PROXY** para `http://{dns-do-alb}/{caminho}`.
- **Backend inalterado** em comportamento; continua atrás do mesmo ALB/target group.

---

## 3. Trade-offs

| Opção | Prós | Contras |
|--------|------|---------|
| **Só ALB** | Menos componentes, menor custo variável | HTTPS no ALB exige ACM + domínio validado (não cobre o requisito “sem domínio próprio”). |
| **API Gateway na frente** | HTTPS imediato no `execute-api`, sem ACM próprio; Terraform simples | Custo por milhão de chamadas; latência extra (~ms); caminho de debug “direto no ALB” ainda HTTP. |
| **CloudFront → ALB** | Cache, WAF no edge | Custom domain ou certificado ainda entram no mesmo problema para “marca” do host; mais peças para este caso. |

**Recomendação:** API Gateway HTTP API como proxy HTTPS — alinhado ao pedido e ao mínimo de trabalho manual.

---

## 4. Implementação Terraform (neste repositório)

Arquivos principais:

- `infra/aws/foundation/api-gateway.tf` — `aws_apigatewayv2_api`, integrações **HTTP_PROXY**, rotas `ANY /{proxy+}` e `ANY /`, stage `$default`.
- `infra/aws/foundation/variables.tf` — `enable_apigatewayv2_alb_proxy`, `api_gateway_cors_allow_origins`.
- `infra/aws/foundation/locals.tf` + `alb.tf` — se existir **ACM** e API Gateway estiver ligado, o listener **:80 não redireciona para :443** (o API Gateway precisa chamar o ALB por **HTTP**).

Ative no `terraform.tfvars`:

```hcl
enable_apigatewayv2_alb_proxy = true
# opcional — restrinja depois:
# api_gateway_cors_allow_origins = ["https://seu-front-no-cloudfront-ou-vercel.app"]
```

Depois: `terraform apply`.

---

## 5. Recursos criados/alterados

**Criados (com `enable_apigatewayv2_alb_proxy = true`):**

- `aws_apigatewayv2_api` (HTTP API)
- `aws_apigatewayv2_integration` (duas: raiz `/` e `/{proxy+}`)
- `aws_apigatewayv2_route` (`ANY /`, `ANY /{proxy+}`)
- `aws_apigatewayv2_stage` (`$default`, auto deploy)

**Alterados:**

- Regra do listener HTTP do ALB quando `acm_certificate_arn != ""` **e** API Gateway habilitado: **forward** em vez de redirect 80→443.

---

## 6. Integração / proxy

- Rotas do API Gateway encaminham para o mesmo host do ALB, preservando caminho (`/api/...`).
- Métodos e corpo são repassados pelo tipo **HTTP_PROXY**.
- O ECS continua recebendo requisições **HTTP** do ALB (como hoje); o TLS termina no **API Gateway** (cliente → AWS) e novamente no **ALB** apenas se você usar HTTPS no ALB separadamente.

---

## 7. URL final HTTPS (front)

Após o apply:

```bash
cd infra/aws/foundation && terraform output -raw api_gateway_https_base_url
```

Formato típico:

`https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com`

**Base para o front:** use essa URL como prefixo da API, por exemplo:

`https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/api/auth/login`

---

## 8. CORS

- **API Gateway:** `cors_configuration` usa `api_gateway_cors_allow_origins` (padrão `["*"]` para lab).
- **App (Express):** continue configurando `CORS_ORIGINS` no ECS se quiser política estrita no backend; em muitos casos o preflight pode ser atendido no API Gateway. Se houver cabeçalhos duplicados, restrinja uma das camadas e teste no browser.

---

## 9. Checklist de validação

1. `terraform output api_gateway_https_base_url` retorna URL **https**.
2. `curl -sS -o /dev/null -w "%{http_code}" "$(terraform output -raw api_gateway_https_base_url)/health"` → `200`.
3. Login:  
   `curl -sS -X POST "$(terraform output -raw api_gateway_https_base_url)/api/auth/login" -H "Content-Type: application/json" -d '{"email":"...","password":"..."}'`
4. No browser (front), chamadas `fetch` para o mesmo host **https** sem erro de certificado.
5. Se `acm_certificate_arn` estiver preenchido: confirmar que o listener :80 **encaminha** (não redireciona) quando `enable_apigatewayv2_alb_proxy = true`.

---

## 10. Rollback

1. No `terraform.tfvars`: `enable_apigatewayv2_alb_proxy = false`
2. `terraform apply` — remove API Gateway e restaura o comportamento anterior do listener HTTP (redirect se houver ACM).
3. O front volta a usar **somente** a URL do ALB (`alb_public_base_url`) se essa era a base anterior.

---

## 11. O que faltaria para produção mais robusta

- **Domínio próprio** + ACM no ALB ou **custom domain** no API Gateway (branding e políticas de certificado únicas).
- **WAF** no API Gateway (v2 suporta associação em regiões suportadas) ou regras adicionais no ALB.
- **Throttle / usage plans** no API Gateway (REST API tem modelos mais ricos; HTTP API tem limites configuráveis).
- **Observabilidade:** access logs do API Gateway para S3/CloudWatch, métricas 4xx/5xx, alarmes.
- **Restringir exposição do ALB** (apenas via API Gateway) costuma exigir **VPC Link** + ALB interno — mais Terraform e sem IP público no ALB.

---

## Referência rápida de variáveis

| Variável | Efeito |
|----------|--------|
| `enable_apigatewayv2_alb_proxy` | Liga/desliga o API Gateway HTTP API. |
| `api_gateway_cors_allow_origins` | Lista de origens CORS no API Gateway. |

Outputs:

| Output | Conteúdo |
|--------|----------|
| `api_gateway_https_base_url` | Base **HTTPS** recomendada para o front. |
| `api_gateway_execution_arn` | ARN da API (políticas IAM, auditoria). |
