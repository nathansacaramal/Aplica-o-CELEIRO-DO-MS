# Stack standards personalizados

## Backend padrão
- Node.js
- TypeScript
- Express para aplicações web pequenas e médias
- arquitetura modularizada
- SOLID + TDD + DDD
- Sequelize como ORM principal
- TypeORM como alternativa

## Banco de dados
- MySQL ou PostgreSQL para fluxos transacionais
- MongoDB quando o modelo documental fizer sentido
- DynamoDB quando o contexto serverless/distribuído justificar
- Redis para cookies, sessions, cache e apoio operacional

## Microsserviços
- Kafka como padrão de mensageria
- contratos explícitos
- atenção forte a observabilidade, idempotência e resiliência

## Frontend padrão
- organização por domínios
- BFF como camada de adaptação para UI
- React, Vue, Angular e Next.js conforme o contexto
- Tailwind CSS para estilização

## Aplicações públicas/comerciais
- SEO como requisito relevante
- estratégia de metadata
- performance web
- tag managers e mensuração desde o desenho inicial

## Diretriz de evolução
- começar pequeno
- manter estrutura pronta para crescimento
- facilitar extração futura para microsserviços sem impor a complexidade deles cedo demais