# Observability guidelines

## Logs
- logs estruturados
- incluir timestamp, nível, contexto, correlation id e evento
- evitar logar segredos
- evitar logs excessivos sem valor operacional

## Métricas mínimas
- latência
- throughput
- taxa de erro
- disponibilidade
- consumo de filas quando houver
- uso de CPU e memória
- métricas de negócio relevantes

## Tracing
- usar correlation id entre serviços
- propagar contexto em integrações síncronas e assíncronas
- rastrear dependências críticas

## Alertas
- erro acima do limiar aceitável
- aumento anormal de latência
- indisponibilidade
- backlog excessivo em filas
- falhas repetidas em integração externa

## Dashboards mínimos
- saúde geral do serviço
- tráfego e latência
- erros por endpoint ou operação
- recursos de infraestrutura essenciais