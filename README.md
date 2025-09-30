# WMS_DEV

Proyecto WMS Premium Delevent  
Stack: **React (TypeScript)** en frontend, **Node.js / Express** en backend y **PostgreSQL** como base de datos.

---

## Arquitectura Hexagonal

El backend está estructurado siguiendo la arquitectura hexagonal, separando el núcleo de negocio (dominio) de los mecanismos externos (adaptadores e infraestructura).  
Esto permite mayor mantenibilidad, testeo y flexibilidad para integrar nuevas fuentes de datos o interfaces.

- **domain/**: Lógica de negocio y entidades principales.
- **application/**: Casos de uso, servicios y orquestación de la lógica de negocio.
- **infrastructure/**: Implementaciones concretas de acceso a datos, integración con sistemas externos (ej: PostgreSQL, Business Central, API REST).

```
backend/
├── domain/         # Entidades y lógica de negocio
│   └── entities/
│       └── Orders/
│           └── Order.js
│           └── IncidentStatus.js
│       └── Exchanges/
│           └── Exchange.js
│       └── Products/
│           └── Product.js
│       └── Incidents/
│           └── Incident.js
│
│   └── ports/
│       └── Orders/
│           └── OrdersRepository.js 
│           └── IncidentStatusRepository.js 
│           └── ReturnOrderRepository.js 
│           └── ReturnStatusRepository.js
│           └── ShipOrderRepository.js
│           └── ShipStatusRepository.js
│       └── Exchanges/
│           └── ExchangeRepository.js 
│       └── Products/
│           └── ProductRepository.js 
│       └── Incidents/
│           └── IncidentsRepository.js 
│
├── application/use-cases    # Casos de uso y servicios
│   └── Orders/
│       └── ListOrdersUseCase.js
│       └── IncidentStatusUseCase.js
│       └── ReturnOrderUseCase.js
│       └── ReturnStatusUseCase.js
│       └── ShipOrderUseCase.js
│       └── ShipStatusUseCase.js
│       └── SyncOrdersUseCase.js
│   └── Exchanges/
│       └── ListExchangesUseCase.js
│       └── SyncExchangesUseCase.js
│   └── Products/
│       └── ListProductsUseCase.js
│       └── SyncProductsUseCase.js
│   └── Incidents/
│       └── ListIncidentsUseCase.js
│
├── infrastructure/ # Adaptadores, persistencia y APIs externas
│   └── api/http/routes
│       └── Orders/
│       └── Exchanges/
│       └── Products/
│       └── Incidents/
│
│   └── database/pg
│       └── Orders/
│           └── PgOrdersRepository.js
│           └── PgIncidentStatusRepository.js
│           └── PgReturnOrderRepository.js
│           └── PgReturnStatusRepository.js
│           └── PgShipOrderRepository.js
│           └── PgShipStatusRepository.js
│       └── Exchanges/
│           └── PgExchangesRepository.js
│       └── Products/
│           └── PgProductRepository.js
│       └── Incidents/
│           └── PgIncidentsRepository.js
│
│   └── external
│       └── BusinessCentralOrdersService.js
│       └── BusinessCentralExchangesService.js
│       └── BusinessCentralProductsService.js
│
│   └── scheduler
│       └── OrdersSyncScheduler.js
│       └── ExchangesSyncScheduler.js
│       └── ProductsSyncScheduler.js
│
├── server.js       
└── ...
```

---

## Requisitos previos

- Node.js ≥ 18
- npm ≥ 9
- Docker Desktop (para PostgreSQL local)
- Variables de entorno configuradas en `.env` en backend

---

## 1️⃣ Levantar Frontend

```bash
cd frontend
npm install
npm run dev
```
Accede a la aplicación en http://localhost:5173 (o el puerto que indique Vite).

## 2️⃣ Levantar Backend

```bash
cd backend
npm install
node server.js
```

El backend correrá en http://localhost:4000.
Endpoints disponibles:

/api/hello → test simple

/api/products-db → productos desde PostgreSQL (stock real)

/api/exchanges-db

/api/orders-db

/api/return-order

/api/ship-order

/api/ship-status

/api/return-status

/api/incident-status

## 3️⃣ Base de datos local con Docker

Instalar y abrir Docker Desktop.

Ejecutar PostgreSQL en un contenedor:

```bash
docker run --name postgres-wms \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=wms \
  -p 5432:5432 \
  -d postgres
```

Acceder a PostgreSQL:

```bash
docker exec -it postgres-wms psql -U admin -d wms
```

Crear la tabla de productos:

```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,      -- id de Business Central
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  stock INT DEFAULT 0
);

CREATE TABLE exchanges (
  id SERIAL PRIMARY KEY,                          -- id autoincremental local
  documentNo VARCHAR(50) NOT NULL,                -- nº documento de BC      
  description TEXT,
  location_code VARCHAR(50),
  shortcut_dimension_1_code VARCHAR(50)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  num VARCHAR(50) UNIQUE NOT NULL,         -- Número de pedido en BC
  sellto_customer_name TEXT,               -- Cliente
  furniture_load_date_jmt TIMESTAMP NULL,  -- Fecha de carga
  jmt_status VARCHAR(50),                  -- Estado
  lineas JSONB NOT NULL DEFAULT '[]',      -- Array JSON con artículos
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  jmtEventName VARCHAR(255)
);

-- Índices útiles
CREATE INDEX idx_orders_num ON orders(num);
CREATE INDEX idx_orders_estado ON orders(jmt_status);
CREATE INDEX idx_orders_lineas_gin ON orders USING gin (lineas jsonb_path_ops);

CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  num VARCHAR(50) UNIQUE NOT NULL,         -- Número de pedido en BC
  sellto_customer_name TEXT,               -- Cliente
  furniture_load_date_jmt TIMESTAMP NULL,  -- Fecha de carga
  jmt_status VARCHAR(50),                  -- Estado
  lineas JSONB NOT NULL DEFAULT '[]',      -- Array JSON con artículos
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  jmtEventName VARCHAR(255)
);


```

## 4️⃣ Sincronización de productos

- La sincronización automática desde Business Central hacia PostgreSQL se ejecuta cada 30 minutos.

- Se realiza al iniciar el servidor backend y mediante cron jobs.

- Los productos se insertan o actualizan automáticamente en la tabla products.

## 5️⃣ Notas

- Asegúrate de que los IDs de Business Central sean alfanuméricos (VARCHAR) en la base de datos.

- El frontend obtiene el stock directamente desde la base de datos (/api/products-db).

- Para producción se recomienda usar PostgreSQL en Cloud y configurar los endpoints BC de forma segura.