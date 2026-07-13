# Documentação — Gestão de Funcionários

Índice da documentação do software. O guia operacional completo para instalar e executar também está resumido no [README da raiz](../README.md).

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [README da raiz](../README.md) | Quick Start, pré-requisitos, testes, troubleshooting |
| [GUIA-EXECUCAO.md](./GUIA-EXECUCAO.md) | Passo a passo detalhado (backend, frontend, Docker, API) |
| [ARQUITETURA.md](./ARQUITETURA.md) | Camadas, entidades, endpoints e decisões técnicas |

## Arranque rápido

1. `docker compose up -d`
2. `.\mvnw.cmd spring-boot:run` (Windows) ou `./mvnw spring-boot:run`
3. `cd frontend-prova && npm install && npm run dev`
4. Abrir http://localhost:5173

Swagger: http://localhost:8080/swagger-ui/index.html
