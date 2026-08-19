# Candidatos a simplificação (duplicação e alinhamento)

Este documento lista padrões repetidos observados entre módulos e no `core`, alinhados às regras em `README-ENGINEERING.md` e `docs/architecture/project-specific-decisions.md`. **Não são tarefas obrigatórias**; servem como backlog para implementação gradual.

## 1. Resposta HTTP e HATEOAS

| Situação | Sugestão |
|----------|-----------|
| Várias controllers montam `ResourceBuilder` / `CollectionResourceBuilder` com o mesmo `addMeta({ correlationId, version: "1.0.0" })` | Extrair helper `withApiMeta(correlationId, extra?: object)` ou método estático nos builders que injeta `version` fixa. |
| Erros 400/404 às vezes com `ResourceBuilder`+`badRequestResource`, às vezes com `AppError`+`mapErrorToHttpResponse` | Padronizar em **`AppError` + `mapErrorToHttpResponse`** para erros de domínio/contrato; manter HATEOAS em erro só onde o Swagger exigir. |
| Imports mistos `@/core/http` vs `@/core/http/http-resource` | Usar apenas o barrel `@/core/http` nas controllers. |

## 2. Paginação e links de lista

| Situação | Sugestão |
|----------|-----------|
| `event-hateoas` passou a delegar para `buildPaginationLinks` (como tourist-points e users) | Revisar outros módulos que ainda montam query string manualmente e migrar. |
| Diferença sutil: listas antigas de eventos sempre expunham `first`/`last`; `buildPaginationLinks` só inclui `first` quando `page > 1` e `last` quando `page < totalPages` | Se algum cliente depender de `first`/`last` sempre presentes, documentar breaking change no Swagger ou estender `buildPaginationLinks` com flag opcional. |

## 3. Validação de query

| Situação | Sugestão |
|----------|-----------|
| `ListEventsController` e `ListTouristPointsController` leem `req.query` cru | Introduzir schemas Zod + `validateQuery` (como `GET /admin/users`), preencher `validatedQuery` no adaptador, rejeitar chaves extras com `.strict()`. |
| Conversão `Number(q.page)` repetida | Centralizar em mapper “query → DTO de listagem” por módulo ou reutilizar `normalizePagination` já usado nos use cases. |

## 4. Mappers entidade → JSON de API

| Situação | Sugestão |
|----------|-----------|
| Cities usam `cityToJson` local na controller | Mover para `presentation/http/mappers` (como `tourist-point-response.mapper` e `event-response.mapper`). |
| `FindCityByIdController` passa `notFound(city)` com entidade — inconsistente | Trocar para `AppError` 404 no use case ou resource de erro tipado, alinhado a events/users/tourist. |

## 5. Casos de uso “get by id”

| Situação | Sugestão |
|----------|-----------|
| Alguns retornam `null`, outros lançam `AppError` | Padronizar em **`AppError` com `statusCode` 404** (padrão já usado em events e, após refatoração, users e tourist-points). |

## 6. Repositório concreto no construtor do use case

| Situação | Sugestão |
|----------|-----------|
| `GetTouristPointByIdUseCase` já depende de `FindTouristPointByIdRepository` | Replicar interfaces explícitas nos demais use cases que ainda recebem classe Sequelize concreta. |

## 7. Core

| Situação | Sugestão |
|----------|-----------|
| `normalizePagination` / `normalizeSort` em vários use cases | Manter como está (boa coesão); opcionalmente documentar no `api-guidelines` como obrigatório para novas listagens. |
| `logger.info` + `logger.error` com `correlationId` e `route` repetidos | Opcional: wrapper `logControllerError(route, correlationId, error)`. |

---

Prioridade sugerida para próximas iterações: **(3) validateQuery nas listagens** e **(4) mappers em cities**, depois **(1) meta/version** se ainda houver ruído visível.

---

## Status (implementado)

- **(3)** `validateQuery` + schemas `.strict()` em `GET /admin|public/events` e `GET /admin|public/tourist-points`; controllers usam `validatedQuery` com fallback `schema.parse(query)`.
- **(4)** `toCityHttpPayload` em `cities/.../mappers/city-response.mapper.ts`; `FindCityByIdUseCase` lança `AppError` **CIDADE_NOT_FOUND**; controller sem `notFound(entidade)`; create/update de eventos delegam validação de cidade ao mesmo use case.
