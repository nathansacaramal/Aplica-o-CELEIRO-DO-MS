# Uso de padrões de projeto (GoF e afins)

Este projeto **não** exige aplicar mecanicamente todos os padrões clássicos. Eles entram quando reduzem acoplamento, duplicação ou ruído, sem inflar a base de código.

## O que já aparece de forma natural

| Padrão / ideia | Onde costuma aparecer |
|----------------|----------------------|
| **Adapter** | Adaptação entre Express e `HttpRequest` / `Controller` no núcleo HTTP. |
| **Factory method** | Arquivos `make-*-controllers` e composição de use cases + repositórios. |
| **Strategy** | Variações de comportamento já existentes (ex.: perfis de usuário), quando encapsuladas por interface. |
| **Builder** | `ResourceBuilder` / `CollectionResourceBuilder` para respostas HATEOAS. |
| **Facade** | Casos de uso como fachada sobre repositórios e serviços de domínio. |
| **Template method** | Hooks genéricos em middlewares e adaptadores (menos comum, implícito). |

## O que exige confirmação explícita

Padrões como **Visitor**, **Mediator**, **Chain of Responsibility**, **Memento**, **Prototype** (clonagem profunda de agregados), **Flyweight** ou **Abstract factory** pesado só devem ser introduzidos com **ADR** ou confirmação explícita da equipe: em muitos casos são *overengineering* para CRUD e listagens paginadas.

## Diretriz

Antes de adicionar um novo padrão GoF, prefira: contratos explícitos (interfaces/DTOs), um caso de uso coeso e testes. Se um padrão novo for proposto, documente o problema que ele resolve e a alternativa mais simples que foi descartada.
