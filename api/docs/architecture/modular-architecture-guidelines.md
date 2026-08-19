# Modular architecture guidelines

## Objetivo
Organizar a aplicação em torno de contextos de negócio, preservando coesão, baixo acoplamento e evolução arquitetural.

## Estrutura conceitual
- core da aplicação
- módulos por contexto
- contratos explícitos
- dependências bem orientadas

## Core
O core deve conter apenas elementos transversais realmente compartilhados, como:
- abstrações comuns
- configurações centrais
- adaptadores transversais
- utilitários de infraestrutura que não pertençam claramente a um único contexto

O core não deve virar depósito genérico de código reutilizável.

## Módulos
Cada módulo deve representar um contexto de negócio.
Cada módulo deve buscar autonomia interna suficiente para:
- evoluir sem afetar outros módulos indevidamente
- expor contratos claros
- facilitar futura extração para microsserviço, se necessário

## Regras importantes
- evitar dependência direta entre detalhes internos de módulos diferentes
- preferir integração por contratos
- não espalhar regras de negócio pelo framework
- preservar casos de uso e domínio como centro da solução