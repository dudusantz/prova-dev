# Sistema de Gest�o de Funcion�rios

Aplica��o full stack para cadastro e gest�o de **Funcion�rios**, **Cargos** e **Departamentos**, com v�nculos empresariais, filtros, pagina��o, relat�rios PDF e testes automatizados.

| Camada | Stack |
|--------|--------|
| Backend | Java 21 � Spring Boot 3.3 � JPA � Flyway � PostgreSQL � OpenPDF |
| Frontend | React 18 � Vite � Tailwind CSS |
| Testes | JUnit/Mockito � Cypress E2E |

Documenta��o detalhada: **[Docs/README.md](Docs/README.md)**

---

## Pr�-requisitos

- **Java 21+** (`java -version`)
- **Maven** (ou use o wrapper `mvnw` / `mvnw.cmd` inclu�do)
- **Node.js 18+** e npm (`node -v`)
- **Docker** (recomendado para o PostgreSQL) **ou** PostgreSQL 15 local
- (Opcional, s� para E2E) navegador Chromium embutido no Cypress

---

## Quick Start

### 1. Subir o banco

Na raiz do reposit�rio:

```bash
docker compose up -d
```

Isto cria o PostgreSQL em `localhost:5432` com:

| Vari�vel | Valor |
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

Na primeira execu��o o **Flyway** cria as tabelas automaticamente (`V1__Criar_Tabelas.sql`).

Swagger UI: http://localhost:8080/swagger-ui/index.html

### 3. Frontend (porta 5173)

Noutro terminal:

```bash
cd frontend-prova
npm install
npm run dev
```

Abra: **http://localhost:5173**

A API base do frontend est� em `frontend-prova/src/services/api.js` ? `http://localhost:8080/api`.

---

## Ordem correcta de arranque

1. Docker / PostgreSQL  
2. Spring Boot (`8080`)  
3. Vite (`5173`)  

Se o frontend arrancar sem o backend, as listagens falham ao carregar dados.

---

## Testes

### Unit�rios (backend)

```bash
# Windows
.\mvnw.cmd test "-Dtest=FuncionarioServiceTest,CargoServiceTest,DepartamentoServiceTest,RelatorioServiceTest"

# Linux / macOS
./mvnw test -Dtest=FuncionarioServiceTest,CargoServiceTest,DepartamentoServiceTest,RelatorioServiceTest
```

### E2E (Cypress)

Com **backend e frontend j� a correr**:

```bash
cd frontend-prova
npx cypress install   # s� na primeira vez
npm run cy:run        # headless
# ou
npm run cy:open       # interface gr�fica
```

---

## Estrutura do reposit�rio

```
prova-dev/
??? Docs/                      # Documenta��o do projeto
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

- CRUD de Funcion�rios (com um ou mais v�nculos), Cargos e Departamentos  
- Regras: CPF �nico, c�digos �nicos, cargo/departamento existentes  
- Listagens com filtros e pagina��o (`page` / `size`)  
- Relat�rios PDF gerados no **backend** (respeitam os filtros actuais)  
- Swagger / OpenAPI  

---

## Problemas comuns

| Sintoma | Causa prov�vel | Solu��o |
|---------|----------------|---------|
| Erro de liga��o � base | Postgres parado ou senha diferente | `docker compose up -d` e alinhar password no YAML |
| `Connection refused :8080` no browser | Backend n�o est� a correr | `.\mvnw.cmd spring-boot:run` |
| P�gina em branco / CORS | API noutro host/porta | Confirmar `api.js` ? `http://localhost:8080/api` |
| Cypress: binary missing | Bin�rio n�o instalado | `npx cypress install` dentro de `frontend-prova` |
| Porta 8080 ocupada | Outra inst�ncia Java | Terminar o processo na 8080 e voltar a arrancar |

---

## Licen�a / contexto

Projeto de desafio t�cnico (prova de desenvolvimento full stack).
