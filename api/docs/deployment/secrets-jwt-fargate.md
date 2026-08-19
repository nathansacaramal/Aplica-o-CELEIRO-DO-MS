# Secrets, JWT e Fargate

## Onde injetar segredos

- **AWS Secrets Manager** ou **SSM Parameter Store** (SecureString) — referenciados na **task definition** do Fargate como `secrets` (ARN → variável de ambiente no container).
- **Nunca** embutir JWT ou senha de banco na imagem Docker.

## Variáveis sensíveis mínimas

| Segredo | Uso |
|---------|-----|
| `JWT_ACCESS_SECRET` | Validação Bearer no `auth-middleware` |
| `JWT_REFRESH_SECRET` | Endpoint refresh |
| `JWT_SECRET` | Compatibilidade / fallbacks no `JwtAuthTokenService` |
| `DB_PASSWORD` | Conexão Sequelize |

Alinhar nomes exatamente aos esperados em `env.ts`.

## IAM da task (S3)

- Task role com política mínima: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` no bucket/prefixo usado por `S3_PUBLIC_PREFIX`.
- Não é necessário (nem desejável) `AWS_ACCESS_KEY_ID` na task se a role cobrir o SDK.

## Rotação de JWT

1. **Access**: troca de `JWT_ACCESS_SECRET` invalida tokens antigos imediatamente — planeje janela ou versionamento de segredo se precisar de rotação sem downtime total.
2. **Refresh**: rotação de `JWT_REFRESH_SECRET` desloga sessões de refresh existentes.
3. Em rotação dupla (segredo N e N+1), seria necessário aceitar ambos no verify — **hoje o código aceita um único segredo**; evolua só se o produto exigir zero downtime na rotação.

## Redis / blacklist

O projeto **não** usa Redis para sessão ou revogação de token. Refresh é JWT stateless; revogação antecipada exigiria store compartilhado (futuro).
