# Critérios de decisão arquitetural
### TypeScript
Usar quando:
- o projeto está no ecossistema Node.js
- a manutenção por time é relevante
- contratos explícitos agregam valor
- integração com frontend TypeScript é importante
- a legibilidade e segurança de refatoração são prioridades

### Python
Usar quando:
- o foco está em IA, ML, automação ou ecossistema científico
- bibliotecas específicas do problema favorecem Python

### Go
Usar quando:
- simplicidade operacional com binário enxuto é relevante
- concorrência e throughput são requisitos fortes
- o time tem maturidade com a linguagem

## Escolha de arquitetura

### Monólito modular
Usar quando:
- o produto ainda está descobrindo domínio
- o time é pequeno ou médio
- o deploy unificado não é problema
- as fronteiras de domínio ainda estão amadurecendo

### Microsserviços
Usar quando:
- há domínios bem delimitados
- times autônomos precisam de deploy independente
- requisitos de escala e isolamento justificam a complexidade
- observabilidade e plataforma já estão maduras

## Escolha de integração

### Síncrona
Usar quando:
- a resposta imediata é obrigatória
- consistência forte é importante para a experiência
- o fluxo é simples e o acoplamento é aceitável

### Assíncrona
Usar quando:
- o processamento pode ser eventual
- o desacoplamento é desejável
- a resiliência é importante
- existem fluxos longos, integração entre domínios ou processamento em background

## Escolha de persistência

### Banco relacional
Usar por padrão em:
- sistemas transacionais
- relações fortes
- necessidade de consistência e consulta estruturada

### Banco documental
Usar quando:
- o agregado é naturalmente documental
- a flexibilidade do schema é uma vantagem real
- a consulta e evolução favorecem modelo orientado a documento