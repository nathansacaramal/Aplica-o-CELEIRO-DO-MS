# README-ENGINEERING

## Objetivo

Este documento define os padrões obrigatórios de engenharia deste projeto.
Toda implementação, refatoração ou alteração de endpoint deve seguir estas regras.

---

## Princípios gerais

- Seguir arquitetura modularizada com `core` e módulos por contexto.
- Seguir SOLID, TDD e DDD.
- Priorizar alta coesão, baixo acoplamento e contratos explícitos.
- Toda mudança deve preservar consistência entre código, contratos e documentação.
- Toda alteração em endpoint deve atualizar a documentação Swagger no mesmo ciclo de mudança.
- Não considerar uma alteração concluída se a documentação Swagger estiver desatualizada.

---

## Padrão de API

### Convenções obrigatórias de status code

Todas as controllers e documentação Swagger devem seguir, sempre que aplicável, o seguinte padrão:

- `201 Created` para criação bem-sucedida de recurso
- `200 OK` para consulta, atualização e operações bem-sucedidas com retorno de conteúdo
- `204 No Content` para operações bem-sucedidas sem corpo de resposta
- `401 Unauthorized` para credenciais inválidas
- `403 Forbidden` para recurso não autorizado
- `404 Not Found` para rota inexistente ou recurso não encontrado

### Regras obrigatórias

- Não usar status code arbitrário sem justificativa técnica clara.
- Toda controller deve explicitar os status codes esperados.
- Toda rota documentada no Swagger deve refletir fielmente os mesmos status codes implementados.
- Toda alteração de contrato HTTP deve refletir imediatamente na documentação Swagger.
- A ausência de atualização da documentação é considerada defeito.

---

## Padrão de resposta

### HATEOAS

Este projeto adota HATEOAS como padrão de resposta para recursos que fazem sentido navegar por links relacionados.

Diretrizes:
- Toda resposta de recurso deve avaliar a inclusão de links relevantes.
- Links devem refletir ações e navegação válidas para o estado atual do recurso.
- Em listagens paginadas, incluir links de paginação quando aplicável.
- Em recursos individuais, incluir links de self e links de ações relacionadas quando fizer sentido.
- HATEOAS não deve adicionar ruído desnecessário; os links devem ser úteis e semanticamente claros.

Exemplos de rels esperados:
- `self`
- `update`
- `delete`
- `list`
- `next`
- `prev`

---

## Regras para listagem, filtros e paginação

### Filtros e paginação em rotas de listagem

As rotas de listagem devem aceitar filtros, paginação e ordenação via `query params`.

Regras obrigatórias:
- os filtros recebidos devem ser transformados internamente em query de pesquisa
- apenas propriedades existentes no DTO de filtro podem ser aceitas
- qualquer propriedade fora do DTO deve ser rejeitada
- não permitir filtros dinâmicos sem contrato
- o DTO é a fonte oficial dos campos permitidos para filtragem
- paginação deve aceitar no mínimo `page` e `limit`
- ordenação, quando suportada, deve aceitar apenas campos previstos no DTO/contrato

### Validação de filtros e paginação

- todo query param recebido deve passar por validação
- query params inválidos não devem seguir para a camada de busca
- a transformação de `query params` em query object deve ser padronizada
- a controller não deve conter regra de montagem de busca complexa; isso deve ser delegável para mapper, adapter ou caso de uso apropriado

### Path params

Path params devem ser usados apenas para identificar recursos específicos ou parâmetros estruturais da rota.

Exemplos:
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

---

## Swagger

### Regra obrigatória de sincronização

Sempre que houver:
- criação de endpoint
- alteração de endpoint
- alteração de request DTO
- alteração de response DTO
- alteração de status code
- alteração de autenticação/autorização
- alteração de parâmetros de rota, query ou path

deve haver atualização correspondente no Swagger.

### Critério de pronto

Uma alteração de endpoint só é considerada pronta quando:
1. a controller foi implementada ou ajustada
2. os DTOs foram refletidos corretamente
3. os status codes foram documentados
4. os exemplos de resposta, quando existirem, estão coerentes
5. os links HATEOAS documentados estão coerentes com a resposta real
6. a documentação Swagger representa o comportamento atual da API

---

## Controllers

Toda controller deve:
- receber apenas dados já validados ou validáveis na borda
- delegar regra de negócio para casos de uso
- retornar status code consistente com a operação
- retornar contrato compatível com Swagger
- respeitar o padrão HATEOAS quando aplicável
- evitar lógica de transformação complexa inline
- utilizar DTOs e contracts claros

---

## DTOs

DTOs devem:
- explicitar os campos aceitos
- servir de base para validação de filtros nas listagens
- refletir o contrato público da API
- evitar propriedades implícitas ou ambíguas

Toda filtragem permitida em listagem deve estar representada em DTO específico.

Exemplo:
- `ListUsersFilterDto`
- `ListOrdersFilterDto`

---

## Critérios de revisão

Ao revisar qualquer endpoint, verificar:
- o status code implementado está correto?
- o status code documentado no Swagger está correto?
- o DTO documentado corresponde ao DTO real?
- a resposta segue HATEOAS quando aplicável?
- a listagem aceita apenas filtros existentes no DTO?
- a transformação dos filtros está desacoplada da controller?
- a documentação está sincronizada com a implementação?

---

## Automação local e qualidade (referência)

- `yarn run check`: typecheck, Prettier (`format:check`), ESLint em `src`, testes com cobertura (no Yarn 1, `yarn check` é comando nativo diferente).
- `yarn format`: aplica Prettier em `src/**/*.ts` e `test/**/*.ts`.
- Hooks Git (Husky): `pre-commit` roda `lint-staged` (ESLint + Prettier em arquivos staged em `src`; Prettier em `test`); `pre-push` roda `typecheck`. Com variável `CI` definida, os hooks não executam (evita atrito em pipelines).
- CI no GitHub replica typecheck, format check, lint, testes, build e smoke; no `yarn install` usa `HUSKY=0` para não acoplar instalação de hooks ao runner. Lockfile único: **`yarn.lock`** (sem `package-lock.json`). Ajuste `.github/CODEOWNERS` ao time real.

---

## Regra para o agente de IA

Ao alterar qualquer endpoint neste projeto, o agente deve obrigatoriamente:
1. identificar impacto na controller
2. identificar impacto nos DTOs
3. identificar impacto na documentação Swagger
4. garantir consistência dos status codes
5. garantir aderência ao padrão HATEOAS
6. validar se filtros da listagem correspondem apenas a campos definidos no DTO
7. considerar a tarefa incompleta se a documentação Swagger não for atualizada

## Paginação em endpoints de listagem

Endpoints de listagem devem suportar paginação, pois o volume de dados pode crescer significativamente.

### Regras obrigatórias

- toda rota de listagem deve aceitar parâmetros de paginação
- a paginação deve ser tratada como parte do contrato público da API
- a paginação deve ser documentada no Swagger
- a resposta paginada deve ser consistente entre os módulos do sistema
- listagens sem paginação só são aceitáveis quando houver justificativa explícita

### Parâmetros mínimos esperados

- `page`: número da página atual
- `limit`: quantidade de itens por página

### Diretrizes

- `page` e `limit` devem ser validados
- valores inválidos não devem seguir para a camada de busca
- a controller deve delegar a montagem da query paginada para camada apropriada
- filtros e paginação devem coexistir no mesmo contrato de listagem
- filtros aceitos continuam restritos às propriedades existentes no DTO

### Resposta paginada

A resposta de listagem deve retornar:
- os dados da página atual
- metadados de paginação
- links HATEOAS de navegação quando aplicável

### Metadados mínimos esperados

- `page`
- `limit`
- `total`
- `totalPages`

### Links HATEOAS esperados em paginação

Quando aplicável, incluir:
- `self`
- `next`
- `prev`
- `first`
- `last`

### Critério de revisão

Ao revisar um endpoint de listagem, verificar:
- existe suporte a paginação?
- paginação está documentada no Swagger?
- paginação está coerente com os filtros?
- os metadados de paginação estão corretos?
- os links HATEOAS de navegação estão corretos?