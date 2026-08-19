# BFF guidelines

## Objetivo
O BFF deve adaptar os dados e fluxos do backend para as necessidades reais da interface, reduzindo acoplamento e simplificando a camada de apresentação.

## Princípios
- entregar para a UI apenas o necessário
- evitar overfetching
- centralizar composição de payloads
- proteger a interface de mudanças desnecessárias em APIs internas
- considerar segurança e performance

## Quando usar
- múltiplas fontes de dados para uma mesma tela
- necessidade de adaptar payload ao caso de uso visual
- necessidade de reduzir lógica de orquestração no frontend
- cenários com diferentes clientes e experiências

## Cuidados
- o BFF não deve virar um backend genérico duplicado
- a lógica de domínio central não deve migrar indevidamente para o BFF
- manter fronteiras claras entre composição de dados e regra de negócio central