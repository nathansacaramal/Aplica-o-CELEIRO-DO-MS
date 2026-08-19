# Fase 1 — S3 + API (mídia pública, permissões mínimas)

Integração **somente Fase 1**: bucket, políticas, variáveis de ambiente, upload via API existente e verificação de leitura via novo endpoint. Não inclui CloudFront, WAF, nem pipeline de deploy completo.

## 1. Arquitetura mínima

```text
┌─────────────┐     PutObject / HeadObject / DeleteObject      ┌──────────────┐
│  API Node   │ ──────────────────────────────────────────────►│  S3 Bucket   │
│  (Admin)    │         credenciais IAM (task role ou AKIA)      │  prefixo     │
└─────────────┘                                                │  public/*    │
       │                                                       └──────────────┘
       │ GET /api/media/verify?url=...  (Head via SDK)                 │
       │ POST /api/media (upload base64)                               │ GetObject
       │                                                                ▼
       │                                                       Internet (leitura
       │                                                       anônima do objeto)
       ▼
 Domínio: contrato `MediaStorageService` (save, delete, head).
 Infra: `S3MediaStorageService` implementa S3; fábrica escolhe S3 ou disco via `ENV`.
```

- **Domínio**: `MediaStorageService` + tipos em `src/modules/media/domain/services/media-storage.service.ts`.
- **Aplicação**: `UploadMediaUseCase`, `VerifyPublicMediaReadableUseCase`.
- **Infra**: `S3MediaStorageService`, `LocalMediaStorageService`, `compose-public-web-image-uploader.ts`.
- **HTTP**: `POST /api/media`, `GET /api/media/verify` (Admin + JWT).

## 2. Onde vive no repositório

| Camada | Caminho |
|--------|---------|
| Contrato storage | `src/modules/media/domain/services/media-storage.service.ts` |
| S3 | `src/modules/media/infra/storage/s3-media-storage.service.ts` |
| Fábrica env | `src/modules/media/infra/factories/compose-public-web-image-uploader.ts` |
| Use cases | `src/modules/media/application/use-cases/` |
| Rotas / controllers | `src/modules/media/presentation/http/` |
| IaC Fase 1 | `infra/aws/s3-phase1/` |
| Swagger | `src/core/docs/swagger/media.yaml` |

## 3. Organização de código (storage)

- **Não** acoplar módulos de negócio (cidades, eventos) ao AWS SDK: eles usam `PublicWebImageUploader` ou fluxos que já encapsulam storage.
- Novas operações S3 **específicas** de infra continuam em `infra/storage/*` implementando o contrato do domínio.
- Endpoints de **diagnóstico** (como `verify`) ficam no módulo `media`, pois são sobre o mesmo bounded context.

## 4. Infraestrutura gerada

Ver `infra/aws/s3-phase1/README.md` e execute `terraform init && terraform apply`.

Principais recursos: bucket, encryption, versioning, bucket policy (GetObject público só em `public/*`), CORS, IAM policy para a app.

## 5. Ajustes na API (já aplicados nesta fase)

- `headOwnedPublicUrl` no contrato e nas implementações S3/local.
- `GET /api/media/verify?url=<URL codificada>` — Admin, valida query com Zod.
- Swagger atualizado para `GET /media/verify`.

## 6. Endpoint mínimo de teste

- **Upload:** `POST /api/media` com body JSON (base64), `visibility: "public"` — já existia.
- **Verificação (API + IAM):** `GET /api/media/verify?url=...` — retorna `contentType`, `contentLength`, `readable: true`.
- **Leitura anônima (internet):** `curl -I <url retornada no upload>` deve retornar `200` após política de bucket aplicada.

## 7. Comandos (local)

```bash
# 1) Subir bucket + política (Terraform)
cd infra/aws/s3-phase1
terraform init && terraform apply

# 2) Exportar / preencher .env (exemplo)
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export MEDIA_STORAGE=s3
export S3_BUCKET="$(terraform output -raw bucket_name)"
export S3_PUBLIC_BASE_URL="$(terraform output -raw s3_public_base_url)"
export S3_PUBLIC_PREFIX=public

# 3) API
npm run dev
```

Obter token Admin (`POST /api/auth/login` ou fluxo do projeto), depois:

```bash
# Upload (exemplo simplificado — ajuste base64 e host/porta)
curl -sS -X POST "http://127.0.0.1:3000/api/media" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"file":{"base64":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==","filename":"px.png","mimeType":"image/png"},"visibility":"public","folder":"phase1"}'

# Verificar leitura via SDK (mesmas credenciais da API)
curl -sS -G "http://127.0.0.1:3000/api/media/verify" \
  --data-urlencode "url=<URL_DO_RESPONSE>" \
  -H "Authorization: Bearer $TOKEN"

# Leitura pública direta
curl -I "<URL_DO_RESPONSE>"
```

## 8. Checklist de validação

- [ ] `terraform apply` sem erros; outputs `bucket_name` e `s3_public_base_url` preenchidos.
- [ ] Política IAM anexada ao principal usado localmente (usuário ou role).
- [ ] `.env` com `MEDIA_STORAGE=s3` e `S3_*` coerentes com o output (URL **sem** barra final, igual ao código).
- [ ] `POST /api/media` com `visibility: public` retorna `url` https apontando para o bucket.
- [ ] `curl -I url` retorna `200` (objeto legível publicamente).
- [ ] `GET /api/media/verify?url=...` retorna `200` com metadados.
- [ ] Objeto no console S3 sob chave `public/...`.

## Critérios de aceite

- Bucket criado com criptografia padrão e acesso anônimo **apenas** em `public/*`.
- IAM da aplicação sem `s3:*` global; sem permissão em prefixos fora do acordado.
- API com `MEDIA_STORAGE=s3` consegue **gravar** e **ler (HEAD)** objetos públicos owned.
- Cliente anônimo consegue **GET** do objeto pela URL pública.
- Documentação e comandos permitem repetir o fluxo em máquina limpa.

## Erros comuns

| Sintoma | Causa provável |
|---------|----------------|
| `AccessDenied` no PutObject | Política IAM não anexada ou `S3_BUCKET` errado. |
| Upload OK, `curl -I` 403 | Bucket policy não aplicada ou `BlockPublicPolicy=true`. |
| `verify` 404 com URL correta | `S3_PUBLIC_BASE_URL` não coincide com a URL gerada (região / path-style / barra final). |
| `Could not load credentials` | `AWS_ACCESS_KEY_ID` / perfil / role ausente no processo Node. |
| CORS no browser | CORS do bucket não cobre o método/origin (GET anônimo costuma ok com a regra Fase 1). |

## Rollback da fase

1. Parar de usar S3: `MEDIA_STORAGE=local` e reiniciar a API.
2. Remover credenciais AWS do ambiente local (opcional).
3. Infra: `terraform destroy` no diretório `infra/aws/s3-phase1` (esvaziar bucket se necessário).

Dados já enviados ao S3: permanecem na conta até exclusão manual ou destroy bem-sucedido.

## O que falta para produção (fora do escopo desta fase)

- CloudFront (ou assinatura) em vez de bucket público direto; OAI/OAC.
- Restringir CORS a origens conhecidas.
- WAF, rate limiting, antivírus / content inspection em upload.
- SSE-KMS, políticas de lifecycle, logs de acesso S3.
- Secrets via Secrets Manager; **sem** access keys em longo prazo — IAM task role no ECS.
- Métricas, alarmes (4xx/5xx, tamanho do bucket), backup e runbook.
- Pin de versão de imagens / módulos Terraform e revisão periódica de políticas.
