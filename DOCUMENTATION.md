# Documentação do Car Wish Backend

Documentação para que qualquer pessoa entenda o **contexto**, as **regras de negócio** e a **estrutura** do projeto.

---

## 1. Contexto do Projeto

### O que é o Car Wish?

O **Car Wish** é um backend para **sistema de gestão de lava-jato**. Ele permite que estabelecimentos (lojas) gerenciem:

- **Clientes** e seus **veículos**
- **Lavagens** (serviços realizados) com valor, forma de pagamento e status
- **Usuários** com diferentes papéis (super admin, admin da loja, funcionário)
- **Comissões** por lavagem para funcionários
- **Dashboard** com resumo do dia (faturamento, número de carros, comissões)

### Multi-tenancy (múltiplas lojas)

O sistema é **multi-tenant**: uma mesma instalação atende várias **lojas** (estabelecimentos). Cada loja tem seus próprios clientes, veículos, lavagens e funcionários. O usuário logado opera sempre no contexto de **uma loja** (exceto o super admin, que pode ver tudo).

### Stack técnica

- **NestJS** – Framework Node.js
- **TypeORM** – ORM para TypeScript
- **PostgreSQL** – Banco de dados
- **Swagger** – Documentação da API em `/docs`
- **JWT** – Autenticação
- **class-validator** – Validação de DTOs

---

## 2. Regras de Negócio

### 2.1 Papéis de usuário (roles)

| Role         | Descrição | Acesso |
|-------------|-----------|--------|
| `super_admin` | Administrador da plataforma | Vê todas as lojas e usuários; pode criar lojas sem vincular; pode vincular loja a um admin. Não precisa de `shopId` no token. |
| `admin`       | Dono de uma ou mais lojas | Vê apenas suas lojas (via relação ManyToMany). Ao criar loja, ela é vinculada a ele. Pode trocar de loja com `PUT /auth/switch-shop`. |
| `employee`    | Funcionário de uma loja | Opera apenas na loja atual (`shopId` no token). Pode ter comissão por lavagem (percentual ou valor fixo). |

### 2.2 Lojas (shops)

- Cada loja tem **nome** e **slug** único.
- Um **admin** pode ser dono de **várias lojas** (tabela `user_shops`).
- O usuário tem um **contexto atual** (`currentShop` / `shopId`): é a loja em que ele está “trabalhando” no momento. Admins trocam de contexto via `PUT /auth/switch-shop`.
- Clientes, veículos e lavagens pertencem a **uma loja** (`shopId`).

### 2.3 Clientes e veículos

- **Cliente** pertence a uma loja; tem nome, telefone, observações e flag `isFrequentCustomer`.
- **Veículo** pertence a um cliente e a uma loja; tem placa, modelo, cor e tipo (`car`, `motorcycle`, `pickup`).
- Listagens e buscas de clientes/veículos são sempre **filtradas pela loja do contexto** (via `TenantGuard` e `@ShopId()`).

### 2.4 Lavagens (car_washes)

- Cada lavagem está ligada a: **veículo**, **cliente**, **loja**.
- **Tipo de serviço**: `basic`, `full`, `polish`.
- **Valor** (amount), **forma de pagamento** (`cash`, `pix`, `card`), **status de pagamento** (`paid`, `pending`).
- **Data/hora** e observações opcionais.
- **Funcionários**: uma lavagem pode ter vários funcionários (ManyToMany `car_wash_user`); usado para calcular comissão por funcionário.

### 2.5 Comissões (funcionários)

- Apenas usuários com role **employee** têm comissão.
- **Tipo**: `percentage` (percentual sobre o valor) ou `fixed` (valor fixo por lavagem).
- **Valor**: número decimal (percentual ou valor em reais).
- No dashboard, as comissões do dia são calculadas com base nas lavagens **pagas** em que o funcionário participou.

### 2.6 Autenticação e contexto de loja

- **Login**: `POST /auth/login` (público) retorna JWT com `sub` (userId), `role` e `shopId` (loja atual).
- **TenantGuard** (global): em rotas não públicas, exige usuário no token; para não–super_admin, exige `shopId`. O `shopId` do token é injetado na request para os serviços.
- **Rotas públicas**: decorator `@Public()` (ex.: login, registro de dono, criação de usuário conforme regras do controller).

### 2.7 Soft delete

- Entidades herdam **BaseEntity** com `deletedAt`. TypeORM usa soft delete quando configurado; assim, “exclusões” podem apenas marcar registro como deletado.

---

## 3. Estrutura do Projeto

```
src/
├── main.ts                      # Bootstrap: prefixo api/v1, CORS, Swagger, ValidationPipe
├── app.module.ts                # Módulo raiz: TypeORM, guards globais (JWT + Tenant), módulos de feature
├── app.controller.ts            # Controller raiz (se houver)
│
├── core/                        # Núcleo da aplicação
│   ├── domain/                  # Camada de domínio
│   │   ├── data.source.ts       # Configuração TypeORM (DataSource)
│   │   ├── entities/            # Entidades (tabelas)
│   │   │   ├── base-entity.entity.ts
│   │   │   ├── shop.entity.ts
│   │   │   ├── user.entity.ts
│   │   │   ├── customer.entity.ts
│   │   │   ├── vehicle.entity.ts
│   │   │   ├── car-wash.entity.ts
│   │   │   └── service.entity.ts
│   │   └── migrations/          # Migrations TypeORM
│   │
│   └── application/             # Casos de uso / aplicação
│       ├── decorators/          # @CurrentUser(), @ShopId(), @Public()
│       ├── guards/              # JwtAuthGuard, TenantGuard, RolesGuard
│       ├── strategies/          # JWT Strategy (Passport)
│       └── services/            # Serviços de negócio
│           ├── auth/
│           ├── shop/
│           ├── user/
│           ├── customer/
│           ├── vehicle/
│           └── washing/
│
└── presentation/                # Camada de apresentação (HTTP)
    ├── controllers/             # Controllers REST por contexto
    │   ├── auth/
    │   ├── shop/
    │   ├── user/
    │   ├── customer/
    │   ├── vehicle/
    │   ├── washing/
    │   └── dashboard/
    └── dtos/                    # DTOs de entrada/saída por contexto
        ├── auth/
        ├── shop/
        ├── user/
        ├── customer/
        ├── vehicle/
        └── washing/
```

### Responsabilidades

- **domain**: entidades, configuração do banco e migrations.
- **application**: lógica de negócio (services), autenticação/autorização (guards, strategies), decorators compartilhados.
- **presentation**: controllers (rotas), DTOs e validação; chama os services e aplica guards/roles.

---

## 4. Modelo de Dados (resumo)

| Entidade   | Tabela       | Relacionamentos principais |
|-----------|--------------|----------------------------|
| Shop      | shops        | 1:N customers, vehicles, car_washes; N:N users (owners via user_shops) |
| User      | users        | N:1 currentShop; N:N shops (owners); N:N car_washes (employees) |
| Customer  | customers    | N:1 shop; 1:N vehicles, car_washes |
| Vehicle   | vehicles     | N:1 shop, customer; 1:N car_washes |
| CarWash   | car_washes   | N:1 shop, vehicle, customer; N:N users (employees) |
| Service   | services     | Catálogo (nome, valor, ícone); sem FK para car_washes no código atual |

### Enums principais

- **User**: `UserRole` (super_admin, admin, employee), `CommissionType` (percentage, fixed).
- **Vehicle**: `VehicleType` (car, motorcycle, pickup).
- **CarWash**: `ServiceType` (basic, full, polish), `PaymentMethod` (cash, pix, card), `PaymentStatus` (paid, pending).

---

## 5. API – Visão geral

- **Base URL**: `http://localhost:3000/api/v1`
- **Documentação interativa**: `http://localhost:3000/docs` (Swagger)
- **Autenticação**: Bearer JWT na maioria das rotas (exceto as marcadas como públicas).

### Principais grupos de endpoints

| Recurso    | Descrição |
|-----------|-----------|
| **Auth**  | `POST /auth/login`, `PUT /auth/switch-shop` |
| **Shops** | Registrar dono (público), listar/criar lojas, vincular loja a admin (super_admin) |
| **Users** | CRUD usuários; listar/filtrar por role e shop (super_admin vs admin) |
| **Customers** | CRUD clientes (sempre no contexto da loja) |
| **Vehicles** | CRUD veículos; busca por placa |
| **Car Washes** | CRUD lavagens; filtro por período; atualizar status de pagamento |
| **Dashboard** | `GET /dashboard/summary` – resumo do dia (total carros, faturamento, comissões por funcionário) |

Os detalhes de cada endpoint (body, query, respostas) estão no Swagger.

---

## 6. Como rodar o projeto

- **Instalação**: `npm install`, copiar `.env.example` para `.env` e ajustar (DB, JWT, CORS).
- **Com Docker**: `docker compose up` (app + PostgreSQL); migrations devem ser rodadas (ex.: `npm run typeorm:migrate` com `DB_HOST=localhost` no `.env` se o banco for acessado da máquina).
- **Sem Docker**: `npm run start:dev` (banco PostgreSQL acessível em `DB_HOST`/porta configuradas).
- **Migrations**: ver seção “Migrations” no `README.md` (gerar, rodar, reverter).

---

## 7. Resumo para novos desenvolvedores

1. **Contexto**: Backend de gestão de lava-jato multi-tenant (várias lojas), com usuários em diferentes papéis e comissão para funcionários.
2. **Regras**: Tudo que é “por loja” (clientes, veículos, lavagens) usa o `shopId` do token; super_admin não tem loja fixa; admin pode trocar de loja; employee só vê a loja atual.
3. **Estrutura**: `core` (domain + application) e `presentation` (controllers + DTOs); guards globais garantem JWT e tenant; roles são aplicadas por rota com `RolesGuard` e `@Roles()`.
4. **API**: Prefixo `api/v1`, documentação em `/docs`; autenticação Bearer JWT na maior parte das rotas.

Com isso, qualquer pessoa consegue entender o contexto, as regras de negócio e a estrutura do Car Wish Backend.
