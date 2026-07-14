# Arquitetura

## Vis�o geral

```
Browser (React :5173)
        ?  HTTP/JSON + download PDF
        ?
Spring Boot API (:8080)
        ?
        ?
PostgreSQL (:5432)  ? Flyway migrations
```

## Backend (pacote `prova_dev`)

| Camada | Responsabilidade |
|--------|------------------|
| `controller` | REST, pagina��o (`page`/`size`), endpoints `/relatorio` |
| `service` | Regras de neg�cio e gera��o de PDF (`RelatorioService`) |
| `repository` | Queries JPA / JPQL com filtros |
| `model` | Entidades: Funcionario, Vinculo, Cargo, Departamento |
| `dto` | Contratos de entrada/sa�da |
| `exception` | `RegraNegocioException` + `GlobalExceptionHandler` |
| `config` | OpenAPI / Swagger |

### Modelo de dados

- **Funcionario** 1:N **Vinculo**
- **Vinculo** N:1 **Cargo** e N:1 **Departamento**
- CPF �nico; c�digos de cargo/departamento �nicos
- Scripts: `src/main/resources/db/migration/`

### Regras principais

- CPF n�o duplicado (cria��o e edi��o)
- C�digo de cargo/departamento n�o duplicado
- V�nculos obrigat�rios no funcion�rio; cargo e departamento devem existir
- Matr�cula �nica por empresa (valida��o na aplica��o)

## Frontend (`frontend-prova`)

| Pasta | Conte�do |
|-------|----------|
| `src/pages` | Listagens, formul�rios Novo/Editar |
| `src/components/layout` | Sidebar e layout |
| `src/services/api.js` | Cliente Axios |
| `src/services/relatorio.js` | Download de PDF da API |
| `cypress/e2e` | Testes E2E |

Listagens usam filtros + pagina��o; o bot�o de relat�rio chama o backend com os filtros actuais (n�o apenas a p�gina vis�vel).

## Testes

- **Unit�rios:** services com Mockito (regras e montagem de PDF)
- **E2E:** Cypress contra API real + UI

## Diferenciais presentes

- Java + React  
- Swagger / OpenAPI  
- Docker Compose para PostgreSQL  
- Relat�rios PDF no backend (OpenPDF)
