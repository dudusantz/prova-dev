# Guia de execu��o

Este guia descreve como preparar o ambiente e correr o projecto do zero.

## 1. Pr�-requisitos

Confirme as ferramentas:

```bash
java -version      # 21+
node -v            # 18+
npm -v
docker -v          # opcional mas recomendado
```

No Windows pode usar o Maven Wrapper (`mvnw.cmd`) sem instalar Maven globalmente.

## 2. Banco de dados (PostgreSQL)

### Op��o A � Docker Compose (recomendado)

Na **raiz** do reposit�rio:

```bash
docker compose up -d
```

Servi�o criado:

- Host: `localhost`
- Porta: `5432`
- Database: `gestao_funcionarios`
- User: `postgres`
- Password: `sua_senha_aqui`

Verificar:

```bash
docker ps
```

Deve aparecer o contentor `gestao_funcionarios_db`.

### Op��o B � PostgreSQL local

Crie a base `gestao_funcionarios` e um utilizador com a mesma password configurada em:

`src/main/resources/application.yaml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gestao_funcionarios
    username: postgres
    password: sua_senha_aqui
```

**Importante:** altere a password no YAML **e** no `docker-compose.yml` em conjunto se mudar o valor por defeito.

## 3. Backend (Spring Boot)

Na raiz:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

O que acontece no arranque:

1. Liga��o ao PostgreSQL  
2. Flyway aplica `src/main/resources/db/migration/V1__Criar_Tabelas.sql`  
3. API dispon�vel em **http://localhost:8080**

### Endpoints �teis

| Recurso | Base |
|---------|------|
| Funcion�rios | `GET/POST /api/funcionarios` � `PUT /api/funcionarios/{id}` |
| Relat�rio funcion�rios | `GET /api/funcionarios/relatorio` |
| Cargos | `GET/POST /api/cargos` � `PUT /api/cargos/{id}` |
| Relat�rio cargos | `GET /api/cargos/relatorio` |
| Departamentos | `GET/POST /api/departamentos` � `PUT /api/departamentos/{id}` |
| Relat�rio departamentos | `GET /api/departamentos/relatorio` |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |

Listagens aceitam filtros e pagina��o, por exemplo:

```
GET /api/funcionarios?nome=Ana&page=0&size=10
GET /api/cargos?codigo=DEV&page=0&size=10
```

Relat�rios PDF usam os **mesmos filtros** e devolvem `application/pdf` (todos os registos filtrados, sem limite de p�gina).

## 4. Frontend (React + Vite)

```bash
cd frontend-prova
npm install
npm run dev
```

Aplica��o: **http://localhost:5173**

A URL da API est� fixa em:

`frontend-prova/src/services/api.js` ? `baseURL: 'http://localhost:8080/api'`

Se o backend correr noutro host/porta, actualize este ficheiro.

### Scripts npm

| Script | Fun��o |
|--------|--------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produ��o |
| `npm run cy:run` | Cypress headless |
| `npm run cy:open` | Cypress interactivo |

## 5. Testes

### Unit�rios

Com o projecto na raiz (n�o precisa do servidor HTTP a correr):

```bash
.\mvnw.cmd test "-Dtest=FuncionarioServiceTest,CargoServiceTest,DepartamentoServiceTest,RelatorioServiceTest"
```

Cobrem regras de CPF/c�digo duplicado, v�nculos, filtros e gera��o de PDF.

### E2E (Cypress)

1. Backend em `8080`  
2. Frontend em `5173`  
3. Depois:

```bash
cd frontend-prova
npx cypress install
npm run cy:run
```

Os specs cobrem cadastro, edi��o, pesquisa, pagina��o e relat�rio das tr�s entidades.

## 6. Checklist de valida��o

- [ ] `docker compose up -d` sem erros  
- [ ] Backend imprime `Started ProvaDevApplication`  
- [ ] Swagger abre no browser  
- [ ] Frontend abre em http://localhost:5173  
- [ ] Consegue criar um Cargo e um Departamento  
- [ ] Consegue criar um Funcion�rio com v�nculo  
- [ ] Bot�o **Baixar Relat�rio** descarrega um PDF  

## 7. Parar o ambiente

```bash
# Terminal do Spring Boot / Vite: Ctrl+C

docker compose down
# (mant�m o volume de dados)

docker compose down -v
# (apaga tamb�m os dados do Postgres)
```
