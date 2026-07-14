# Sistema de Gestão de Funcionários

Aplicação full stack para cadastro e gestão de **Funcionários**, **Cargos** e **Departamentos**, com vínculos empresariais, filtros, situação ativo/inativo, paginação, relatórios PDF e testes automatizados.

| Camada | Stack |
|--------|--------|
| Backend | Java 21 · Spring Boot 3.3 · JPA · Flyway · PostgreSQL · OpenPDF |
| Frontend | React 18 · Vite · Tailwind CSS |
| Testes | JUnit / Mockito · Cypress E2E |

Documentação complementar: **[Docs/README.md](Docs/README.md)**

---

## Pré-requisitos

Antes de começar, tenha instalado:

| Ferramenta | Versão mínima | Como verificar |
|------------|---------------|----------------|
| Git | — | `git --version` |
| Java JDK | 21+ | `java -version` |
| Node.js | 18+ | `node -v` |
| npm | — | `npm -v` |
| Docker Desktop | — | `docker -v` |

No Windows e no Linux/macOS o projeto já inclui o **Maven Wrapper** (`mvnw.cmd` / `mvnw`), então **não é obrigatório** instalar Maven globalmente.

> No Windows, abra o **Docker Desktop** e aguarde até ficar em execução antes do passo do banco.

---

## Como rodar (do zero)

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd prova-dev
```

### 2. Subir o PostgreSQL

Na **raiz** do projeto:

```bash
docker compose up -d
```

Credenciais usadas pelo Compose e pelo Spring (já alinhadas):

| Campo | Valor |
|-------|--------|
| Host | `localhost` |
| Porta | `5432` |
| Database | `gestao_funcionarios` |
| User | `postgres` |
| Password | `sua_senha_aqui` |

Confirme o container:

```bash
docker ps
```

Deve aparecer `gestao_funcionarios_db`.

### 3. Subir o backend (API na porta 8080)

Ainda na **raiz** do projeto, em um terminal:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Na primeira execução o **Flyway** cria/atualiza as tabelas automaticamente.

Aguarde até a aplicação iniciar. Depois valide:

- API: http://localhost:8080/api  
- Swagger: http://localhost:8080/swagger-ui/index.html  

### 4. Subir o frontend (porta 5173)

Abra **outro** terminal na raiz do projeto:

```bash
cd frontend-prova
npm install
npm run dev
```

Abra no navegador: **http://localhost:5173**

A base da API no frontend está em `frontend-prova/src/services/api.js` → `http://localhost:8080/api`.

---

## Ordem de arranque

1. Docker Desktop + `docker compose up -d`  
2. Backend (`8080`)  
3. Frontend (`5173`)  

---

## Testes

### Unitários (backend)

Com o projeto na raiz:

```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```

### E2E (Cypress)

Com **backend e frontend já rodando**:

```bash
cd frontend-prova
npx cypress install
npm run cy:run
```

Para abrir a interface gráfica:

```bash
npm run cy:open
```

---

## Estrutura do repositório

```
prova-dev/
├── Docs/                 # Documentação do projeto
├── src/                  # Backend Spring Boot
│   └── main/resources/
│       ├── application.yaml
│       └── db/migration/ # Scripts Flyway
├── frontend-prova/       # Frontend React (Vite)
├── docker-compose.yml    # PostgreSQL
├── pom.xml
└── README.md
```

---

## Funcionalidades principais

- CRUD de Funcionários (com um ou mais vínculos), Cargos e Departamentos  
- Situação **ativo/inativo** em cargos, departamentos, funcionários e vínculos  
- Regras: CPF único, códigos únicos, funcionário só inativa sem vínculo ativo  
- Listagens com filtros, paginação e ordenação alfabética  
- Relatórios PDF gerados no backend  
- Swagger / OpenAPI  
- Testes unitários e E2E  

---

## Licença / contexto

Projeto de desafio técnico (prova de desenvolvimento full stack).
