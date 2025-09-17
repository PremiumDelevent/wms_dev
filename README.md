# WMS_DEV

Proyecto WMS Premium Delevent  
Stack: **React (TypeScript)** en frontend, **Node.js / Express** en backend y **PostgreSQL** como base de datos.

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

/api/products → productos desde Business Central

/api/sales-lines → líneas de venta BC

/api/products-db → productos desde PostgreSQL (stock real)

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

CREATE TABLE intercambios (
  id SERIAL PRIMARY KEY,                          -- id autoincremental local
  documentNo VARCHAR(50) NOT NULL,                -- nº documento de BC      
  description TEXT,
  location_code VARCHAR(50),
  shortcut_dimension_1_code VARCHAR(50)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,           -- ID interno del pedido
    num VARCHAR(50) NOT NULL UNIQUE, -- Número de pedido (No)
    sellto_customer_name VARCHAR(255) NOT NULL,
    furniture_load_date_jmt TIMESTAMP,
    jmt_status VARCHAR(50)
);

CREATE TABLE order_lines (
    id SERIAL PRIMARY KEY,           -- ID interno de la línea
    pedido_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- relación con pedidos
    num VARCHAR(50) NOT NULL,        -- número o código del artículo
    descr VARCHAR(255),
    quantity INT NOT NULL
);

ALTER TABLE order_lines ADD CONSTRAINT order_lines_unique_line UNIQUE (pedido_id, num);

ALTER TABLE order_lines ALTER COLUMN quantity TYPE NUMERIC;
```

## 4️⃣ Sincronización de productos

- La sincronización automática desde Business Central hacia PostgreSQL se ejecuta cada 30 minutos.

- Se realiza al iniciar el servidor backend y mediante cron jobs.

- Los productos se insertan o actualizan automáticamente en la tabla products.

## 5️⃣ Notas

- Asegúrate de que los IDs de Business Central sean alfanuméricos (VARCHAR) en la base de datos.

- El frontend obtiene el stock directamente desde la base de datos (/api/products-db).

- Para producción se recomienda usar PostgreSQL en Cloud y configurar los endpoints BC de forma segura.