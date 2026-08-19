# Checklist antes de novas implementações e antes do deploy

Revise este documento **antes** de iniciar melhorias relevantes ou de preparar/executar deploy (SRE/DevOps).

## 1. Segredos em produção

- Tratar `ADMIN_PASSWORD`, `JWT_*`, `DB_PASSWORD` (e demais sensíveis) com armazenamento gerenciado (ex.: Secrets Manager, Parameter Store, variáveis cifradas no pipeline).
- Definir rotação e controle de acesso (quem lê o quê em cada ambiente).

## 2. Procedimento de deploy

- Ordem explícita sugerida: **backup** → **`db:migrate`** → **subir aplicação** → **smoke / `GET /ready`**.
- Definir política de **seed**: só no primeiro provisionamento, manual, ou **nunca** em produção automatizada.

## 3. Imagem MySQL no CI

- Fixar **tag** ou **digest** da imagem (ex.: `mysql:8.0.x` ou SHA) no workflow para builds reproduzíveis e menor surpresa de supply chain.

## 4. Migrations vs `sync` no app

- Em **produção**: `UPDATE_MODEL=false` e evolução de schema só via **migrations**.
- Há chamadas a `Model.sync()` em alguns fluxos de repositório (úteis com `UPDATE_MODEL=true` em dev); confirmar que produção não depende de `sync` para criar/alterar tabelas.

---

*Itens acordados com o time para lembrar antes de SRE/DevOps e antes de novas features de impacto operacional.*
