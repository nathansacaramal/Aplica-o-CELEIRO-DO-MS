# Política de segurança

## Reportar vulnerabilidade

Se você encontrar um problema de segurança neste repositório ou na API em produção:

1. **Não** abra issue pública com detalhes exploráveis.
2. Entre em contato com os mantenedores do repositório por canal privado (e-mail ou recurso de **Security advisories** do GitHub, se habilitado na organização).

Inclua, quando possível: descrição do impacto, passos para reproduzir e versão/commit afetados.

## Boas práticas no GitHub (mantenedores)

Configure na organização ou neste repositório:

- **Branch protection** em `main`: sem push direto; pull request obrigatório; *required status checks* alinhados ao workflow `CI` (jobs `quality` e, se desejado, `database`).
- **Required reviews** (mínimo 1) e, se fizer sentido, **dismiss stale pull request approvals** quando novos commits forem enviados.
- **Secret scanning** e **push protection** para segredos.
- **Dependabot security updates** (complementar ao `dependabot.yml` de versões).
- **Permissões mínimas** para `GITHUB_TOKEN` nos workflows (`permissions` já restrito onde aplicável).
- **CODEOWNERS**: existe `.github/CODEOWNERS` (ajuste `@` para times/usuários reais); use regras por pasta se o time crescer (`src/`, `infra/`, `.github/`).

Estas ações são feitas na interface do GitHub; este arquivo documenta o alvo operacional.
