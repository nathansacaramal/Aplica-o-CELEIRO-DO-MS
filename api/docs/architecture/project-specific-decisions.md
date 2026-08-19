# Project Specific Decisions

## Objetivo

Este documento registra decisões arquiteturais específicas deste projeto.
Essas decisões devem ser tratadas como padrão oficial, salvo substituição explícita por nova ADR.

---

## 1. API com HATEOAS

### Decisão
Este projeto adota HATEOAS como padrão de resposta para recursos expostos pela API, sempre que isso agregar navegabilidade e clareza ao consumidor.

### Motivação
- padronizar navegação entre recursos
- melhorar descoberta de ações disponíveis
- reduzir acoplamento do cliente a fluxos fixos
- tornar respostas mais expressivas

### Implicações
- responses devem prever objeto de links
- listagens paginadas devem avaliar links de navegação
- recursos individuais devem incluir links relevantes como `self` e ações relacionadas
- controllers, presenters e mappers devem considerar a construção de links como parte do contrato de resposta

---

## 2. Padronização oficial de status code

### Decisão
Todos os endpoints e documentação Swagger devem seguir o seguinte padrão oficial:

- `201 Created` para criação
- `200 OK` para sucesso com conteúdo
- `204 No Content` para sucesso sem conteúdo
- `401 Unauthorized` para credenciais inválidas
- `403 Forbidden` para recurso não autorizado
- `404 Not Found` para recurso ou rota não encontrada

### Motivação
- manter consistência semântica da API
- facilitar uso pelos clientes
- reduzir divergência entre endpoints
- simplificar manutenção e documentação

### Implicações
- controllers devem seguir esse padrão
- swagger deve documentar exatamente esses cenários
- factories, helpers e presenters devem respeitar esse contrato
- mudanças em responses devem ser refletidas em toda a documentação

---

## 3. Swagger como representação oficial do contrato HTTP

### Decisão
A documentação Swagger é parte do contrato oficial do sistema e deve permanecer sincronizada com a implementação.

### Motivação
- evitar divergência entre código e contrato publicado
- facilitar integração com consumidores
- melhorar confiabilidade da documentação
- apoiar manutenção e testes

### Implicações
- nenhuma mudança de endpoint é considerada concluída sem atualização do Swagger
- mudanças de rota, DTO, autenticação, parâmetros ou status code exigem atualização documental
- o processo de revisão deve validar implementação e documentação conjuntamente

---

## 4. Filtros e paginação em rotas de listagem

### Decisão
As rotas de listagem aceitam filtros, paginação e ordenação via `query params`, e esses parâmetros devem ser transformados internamente em query de pesquisa.

### Motivação
- aderir ao padrão mais comum e previsível de APIs HTTP
- facilitar documentação Swagger/OpenAPI
- simplificar evolução do contrato de busca
- manter separação clara entre identificação de recurso e critérios de pesquisa

### Implicações
- controllers devem apenas orquestrar recebimento e encaminhamento
- transformação deve ocorrer em mapper, adapter ou componente apropriado
- casos de uso devem receber query object consistente
- a lógica de busca não deve depender diretamente do formato bruto da query string
- `path params` ficam reservados para identificação de recurso, como `id`

### Regra oficial
- `path params` para `id` e identificação de recurso
- `query params` para filtros, paginação, ordenação e busca

---

## 5. Restrição de filtros com base no DTO

### Decisão
Somente propriedades explicitamente definidas no DTO de filtro podem ser aceitas nas rotas de listagem.

### Motivação
- evitar filtros implícitos ou não documentados
- manter contrato claro e previsível
- reduzir risco de acoplamento a detalhes internos
- aumentar segurança e governança do contrato público

### Implicações
- o DTO de filtro é a fonte oficial dos campos permitidos
- propriedades desconhecidas devem ser rejeitadas ou tratadas conforme regra do projeto
- swagger deve refletir apenas filtros oficialmente suportados
- alterações em filtros exigem atualização simultânea de DTO, controller e Swagger

---

## 6. Responsabilidade arquitetural da controller

### Decisão
Controllers não devem concentrar regras de negócio nem regras complexas de transformação de filtro.

### Motivação
- preservar baixo acoplamento
- facilitar testes
- manter responsabilidade única
- permitir evolução da lógica sem inflar a borda HTTP

### Implicações
- controllers delegam para caso de uso, mapper ou adapter apropriado
- montagem de query de pesquisa deve ficar fora da controller quando houver complexidade relevante
- a controller deve focar em entrada, saída e orquestração

---

## 7. Critério de pronto para endpoints

### Decisão
Um endpoint só é considerado pronto quando implementação e documentação estiverem consistentes.

### Critério mínimo
- controller implementada
- DTOs corretos
- status codes corretos
- response compatível com HATEOAS quando aplicável
- filtros limitados ao DTO oficial
- swagger atualizado

### Implicação
Pull requests que alterem endpoint sem refletir a mudança no Swagger devem ser tratados como incompletos.

## 8. Paginação obrigatória em endpoints de listagem

### Decisão
Todos os endpoints de listagem deste projeto devem suportar paginação.

### Motivação
- o volume de dados pode crescer de forma significativa
- evitar respostas excessivamente grandes
- melhorar performance e previsibilidade da API
- facilitar navegação, consumo e escalabilidade
- padronizar comportamento entre módulos

### Implicações
- rotas de listagem devem aceitar parâmetros de paginação
- paginação deve coexistir com filtros
- Swagger deve documentar os parâmetros e o contrato de resposta paginada
- responses paginadas devem incluir metadados consistentes
- responses paginadas devem incluir links HATEOAS de navegação quando aplicável

### Contrato mínimo esperado
Parâmetros:
- `page`
- `limit`

Metadados:
- `page`
- `limit`
- `total`
- `totalPages`

Links HATEOAS esperados quando aplicável:
- `self`
- `next`
- `prev`
- `first`
- `last`

### Diretriz arquitetural
A controller não deve concentrar lógica complexa de paginação.
A transformação da entrada paginada em query object deve ser delegada para componente apropriado.
O caso de uso deve receber filtros e paginação de forma explícita e validada.

---

## 9. Listagem de usuários (admin)

### Decisão
`GET /api/admin/users` segue o contrato de listagem paginada do projeto: query validada com Zod (`.strict()`), repositório com `list` que retorna itens + total, caso de uso calcula `totalPages`, resposta em coleção HATEOAS com links de paginação (`self`, `prev`, `next`, `first`, `last` quando aplicável) e `create`.

### Contrato de query
- `page`, `limit`, `sortBy` (`name` \| `email` \| `createdAt`), `sortDir` (`asc` \| `desc`), `name` (busca parcial), `email` (igualdade exata).
- Não há filtro por `status` até existir coluna correspondente no modelo de persistência.

### Segurança de resposta
Itens da lista expõem apenas dados seguros (sem `password`), via view model na camada de apresentação.

### Transporte HTTP
O adaptador Express repassa `validatedQuery` para `HttpRequest` quando o middleware `validateQuery` tiver sido aplicado à rota.