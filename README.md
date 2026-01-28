# Car Wish Backend

Backend para sistema de gestão de lava-jato desenvolvido com NestJS, TypeORM e PostgreSQL.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Banco de dados
- **Swagger** - Documentação da API
- **class-validator** - Validação de DTOs

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

## 🚀 Executando em desenvolvimento

Com Docker (app + banco, igual ao sgtu-backend):

```bash
docker compose up
```

O `package.json` e o `src/` são montados como volume, então alterações no código refletem sem rebuild. O banco fica no serviço `database`; dentro do container a API usa `DB_HOST=database` (nome do serviço).

Sem Docker (só a API local, banco em outro lugar):

```bash
npm run start:dev
```

Use `DB_HOST=localhost` no `.env` se o PostgreSQL estiver rodando na máquina.

## 🗄️ Banco de Dados

PostgreSQL. No docker-compose o serviço se chama `database`. Variáveis no `.env`:

```env
DB_HOST=database
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=car_wish
```

Para rodar migrações ou gerar migrations com o banco no Docker, use `DB_HOST=localhost` no `.env` e execute os comandos na máquina (não dentro do container).

### Migrations

```bash
# Gerar migration
npm run typeorm:generate -- src/core/domain/migrations/NomeDaMigration

# Executar migrations
npm run typeorm:migrate

# Reverter última migration
npm run typeorm:revert
```

## 📚 API Endpoints

A documentação completa da API está disponível em Swagger após iniciar o servidor:

- **Swagger UI**: http://localhost:3000/docs

### Principais Endpoints

- `GET /api/v1/clientes` - Listar clientes
- `POST /api/v1/clientes` - Criar cliente
- `GET /api/v1/veiculos` - Listar veículos
- `POST /api/v1/veiculos` - Criar veículo
- `GET /api/v1/veiculos/placa/:placa` - Buscar veículo por placa
- `GET /api/v1/lavagens` - Listar lavagens
- `POST /api/v1/lavagens` - Registrar nova lavagem
- `GET /api/v1/funcionarios` - Listar funcionários
- `POST /api/v1/funcionarios` - Criar funcionário
- `GET /api/v1/dashboard/resumo` - Resumo do dashboard

## 🏗️ Estrutura do Projeto

```
src/
├── core/
│   ├── domain/
│   │   ├── entities/          # Entidades do banco de dados
│   │   └── data.source.ts     # Configuração do TypeORM
│   └── application/
│       └── services/           # Serviços de negócio
├── presentation/
│   ├── controllers/           # Controllers REST
│   └── dtos/                  # Data Transfer Objects
└── main.ts                    # Arquivo principal
```

## 🔐 Autenticação

A autenticação será implementada em uma próxima versão. Por enquanto, os endpoints estão abertos.

## 📝 Notas

- O sistema está configurado para desenvolvimento
- As migrations devem ser executadas antes do primeiro uso
- O Swagger está disponível em `/docs` quando o servidor estiver rodando
