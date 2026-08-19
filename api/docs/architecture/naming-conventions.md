# Convenções de nomenclatura

## Arquivos
- kebab-case
- exemplos:
  - create-user.use-case.ts
  - user-controller.ts
  - auth-middleware.ts
  - publish-order-created-event.ts

## Classes, types e interfaces
- PascalCase
- exemplos:
  - CreateUserUseCase
  - UserRepository
  - JwtTokenService
  - CreateUserInput

## Métodos e funções
- camelCase com verbo claro
- exemplos:
  - createUser
  - findUserByEmail
  - validatePassword
  - publishOrderCreatedEvent
  - mapOrderToResponse

## Booleanos
- is, has, can, should
- exemplos:
  - isActive
  - hasPermission
  - canRetry
  - shouldPublishEvent

## Diretrizes gerais
- nomes devem refletir intenção
- evitar abreviações desnecessárias
- evitar nomes vagos como manager, helper, common, utils, processor sem contexto
- nomes de casos de uso devem refletir ação de negócio
- nomes de repositórios devem refletir o agregado ou entidade principal