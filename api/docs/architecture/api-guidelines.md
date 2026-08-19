# API guidelines

## Princípios
- contratos explícitos
- validação na borda
- respostas previsíveis
- erros padronizados
- versionamento quando necessário
- documentação das rotas críticas

## Erros
- retornar mensagens claras e úteis
- não vazar detalhes internos sensíveis
- usar códigos HTTP coerentes
- incluir correlation id quando aplicável

## Idempotência
- considerar em endpoints de criação crítica, pagamentos, pedidos e reprocessamento
- registrar chave de idempotência quando necessário

## Resiliência
- definir timeout em chamadas externas
- usar retry apenas em erros transitórios
- registrar falhas com contexto útil

## Segurança
- autenticar e autorizar explicitamente
- nunca confiar em dados do cliente sem validação
- proteger segredos e credenciais

## Contrato padrão de resposta paginada

Toda resposta paginada deve seguir a estrutura:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "links": {
    "self": "/v1/users/page/1/limit/10",
    "next": "/v1/users/page/2/limit/10",
    "prev": null,
    "first": "/v1/users/page/1/limit/10",
    "last": "/v1/users/page/10/limit/10"
  }
}

## Exemplo de listagem com query params

### Requisição

`GET /v1/users?page=1&limit=10&name=john&status=active&sortBy=createdAt&sortDir=desc`

### Regras
- `page` e `limit` controlam paginação
- filtros devem existir no DTO/schema de query do recurso
- `sortBy` só pode aceitar campos previamente definidos
- `sortDir` aceita apenas valores previstos no contrato
- parâmetros desconhecidos devem ser rejeitados

### Exemplo de resposta

```json
{
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "status": "active",
      "links": {
        "self": "/v1/users/1",
        "update": "/v1/users/1",
        "delete": "/v1/users/1"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  },
  "links": {
    "self": "/v1/users?page=1&limit=10&name=john&status=active&sortBy=createdAt&sortDir=desc",
    "next": "/v1/users?page=2&limit=10&name=john&status=active&sortBy=createdAt&sortDir=desc",
    "prev": null,
    "first": "/v1/users?page=1&limit=10&name=john&status=active&sortBy=createdAt&sortDir=desc",
    "last": "/v1/users?page=5&limit=10&name=john&status=active&sortBy=createdAt&sortDir=desc"
  }
}
```

---

# Sobre validar query params com Zod

Sim, isso é uma ótima abordagem.

Ela ajuda a garantir:

- só entra o que pertence ao contrato
- tipos são normalizados
- paginação e ordenação ficam previsíveis
- parâmetros desconhecidos podem ser rejeitados
- a controller recebe entrada saneada

Mas um ponto importante:

## Isso **não é, sozinho, a proteção contra SQL Injection**

O Zod ajuda no **controle do contrato de entrada**, mas a proteção real contra SQL injection depende principalmente de:

- uso correto do ORM/query builder
- queries parametrizadas
- nunca interpolar string manualmente em SQL
- whitelist para campos de ordenação
- validação de operadores permitidos

Ou seja:

- **Zod**: protege o contrato de entrada
- **ORM/query parametrizada**: protege a execução no banco

Os dois juntos fazem sentido.

---

# Exemplo de middleware com Zod para query params

Abaixo vai um exemplo bom para Express + TypeScript.

## Middleware genérico

```ts
import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject, ZodRawShape } from 'zod';

type RequestWithValidatedQuery<T> = Request & {
  validatedQuery?: T;
};

export const validateQuery =
  <T extends ZodRawShape>(schema: ZodObject<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsedQuery = schema.parse(req.query);

      (req as RequestWithValidatedQuery<Record<string, unknown>>).validatedQuery =
        parsedQuery;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Invalid query params',
          errors: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });

        return;
      }

      next(error);
    }
  };
  ```

---
## Validação de query params

Todos os query params de listagem devem ser validados com schema explícito.
O schema deve:
- aceitar apenas campos previstos no contrato do recurso
- rejeitar parâmetros desconhecidos
- validar paginação
- validar ordenação
- normalizar tipos quando necessário

A validação de entrada não substitui o uso de queries parametrizadas ou ORM seguro.

---