# Sistema de Gestão de Funcionários

Aplicação full stack para cadastro e gestão de **Funcionários**, **Cargos** e **Departamentos**, com vínculos empresariais, filtros, paginação, relatórios PDF e testes automatizados.

| Camada | Stack |
|--------|--------|
| Backend | Java 21 · Spring Boot 3.3 · JPA · Flyway · PostgreSQL · OpenPDF |
| Frontend | React 18 · Vite · Tailwind CSS |
| Testes | JUnit/Mockito · Cypress E2E |

Documentação detalhada: **[Docs/README.md](Docs/README.md)**

---

## Pré-requisitos

- **Java 21+** (`java -version`)
- **Maven** (ou use o wrapper `mvnw` / `mvnw.cmd` incluído)
- **Node.js 18+** e npm (`node -v`)
- **Docker** (recomendado para o PostgreSQL) **ou** PostgreSQL 15 local
- (Opcional, só para E2E) navegador Chromium embutido no Cypress

---

## Quick Start

### 1. Subir o banco

Na raiz do repositório:

```bash
docker compose up -d
```

Isto cria o PostgreSQL em `localhost:5432` com:

| Variável | Valor |
|----------|--------|
| Database | `gestao_funcionarios` |
| User | `postgres` |
| Password | `sua_senha_aqui` |

> A senha em `docker-compose.yml` e em `src/main/resources/application.yaml` deve ser **igual**.

### 2. Backend (porta 8080)

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Na primeira execução o **Flyway** cria as tabelas automaticamente (`V1__Criar_Tabelas.sql`).

Swagger UI: http://localhost:8080/swagger-ui/index.html

### 3. Frontend (porta 5173)

Noutro terminal:

```bash
cd frontend-prova
npm install
npm run dev
```

Abra: **http://localhost:5173**

A API base do frontend está em `frontend-prova/src/services/api.js` ? `http://localhost:8080/api`.

---

## Ordem correcta de arranque

1. Docker / PostgreSQL  
2. Spring Boot (`8080`)  
3. Vite (`5173`)  

Se o frontend arrancar sem o backend, as listagens falham ao carregar dados.

---

## Testes

### Unitários (backend)

```bash
# Windows
.\mvnw.cmd test "-Dtest=FuncionarioServiceTest,CargoServiceTest,DepartamentoServiceTest,RelatorioServiceTest"

# Linux / macOS
./mvnw test -Dtest=FuncionarioServiceTest,CargoServiceTest,DepartamentoServiceTest,RelatorioServiceTest
```

### E2E (Cypress)

Com **backend e frontend já a correr**:

```bash
cd frontend-prova
npx cypress install   # só na primeira vez
npm run cy:run        # headless
# ou
npm run cy:open       # interface gráfica
```

---

## Estrutura do repositório

```
prova-dev/
??? Docs/                      # Documentação do projeto
??? src/                       # Backend Spring Boot
?   ??? main/resources/
?       ??? application.yaml
?       ??? db/migration/      # Scripts Flyway
??? frontend-prova/            # Frontend React (Vite)
??? docker-compose.yml         # PostgreSQL
??? pom.xml
??? README.md
```

---

## Funcionalidades principais

- CRUD de Funcionários (com um ou mais vínculos), Cargos e Departamentos  
- Regras: CPF único, códigos únicos, cargo/departamento existentes  
- Listagens com filtros e paginação (`page` / `size`)  
- Relatórios PDF gerados no **backend** (respeitam os filtros actuais)  
- Swagger / OpenAPI  

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| Erro de ligação à base | Postgres parado ou senha diferente | `docker compose up -d` e alinhar password no YAML |
| `Connection refused :8080` no browser | Backend não está a correr | `.\mvnw.cmd spring-boot:run` |
| Página em branco / CORS | API noutro host/porta | Confirmar `api.js` ? `http://localhost:8080/api` |
| Cypress: binary missing | Binário não instalado | `npx cypress install` dentro de `frontend-prova` |
| Porta 8080 ocupada | Outra instância Java | Terminar o processo na 8080 e voltar a arrancar |

---

## Licença / contexto

Projeto de desafio técnico (prova de desenvolvimento full stack).
