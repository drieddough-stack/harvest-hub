# LocalConnect

A matchmaking platform connecting local producers (farms, bakeries, artisans) with retailers (grocery stores, markets, cafes).

## Tech Stack

- **Frontend:** Vite + React (port 5173)
- **Backend:** Node.js + Express (port 3001)
- **Database:** SQLite via team-db CLI (Turso-synced)

## Project Structure

```
localconnect/
├── ARCHITECTURE.md     # Full system architecture docs
├── server/             # Express backend API
│   ├── package.json
│   └── src/
│       ├── index.js          # Entry point
│       ├── db.js             # team-db wrapper
│       ├── schema.sql        # Database DDL
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── validation.js
│       └── routes/
│           ├── producers.js  # CRUD for producers
│           ├── retailers.js  # CRUD for retailers
│           ├── products.js   # CRUD for products
│           ├── listings.js   # Product listings with pricing/availability
│           ├── orders.js     # Order management (auto-creates matches)
│           ├── matches.js    # Producer-retailer match tracking
│           └── search.js     # Full-text search
├── client/             # Vite + React frontend (to be built)
└── dev.sh              # One-command dev startup
```

## Quick Start

### 1. Install server dependencies

```bash
cd server && npm install
```

### 2. Initialize the database

```bash
cd server && npm run db:init
```

### 3. Start the API server

```bash
cd server && npm run dev
```

The API runs at `http://localhost:3001`. Health check: `http://localhost:3001/api/health`

### 4. Start the frontend (separate terminal)

```bash
cd client && npm install && npm run dev
```

The frontend runs at `http://localhost:5173` (proxies API requests to :3001).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/producers | List producers (filters: type, location, search) |
| GET | /api/producers/:id | Get producer with products & listings |
| POST | /api/producers | Create producer |
| PUT | /api/producers/:id | Update producer |
| DELETE | /api/producers/:id | Soft-delete producer |
| GET | /api/retailers | List retailers |
| GET | /api/retailers/:id | Get retailer with orders & matches |
| POST | /api/retailers | Create retailer |
| PUT | /api/retailers/:id | Update retailer |
| DELETE | /api/retailers/:id | Soft-delete retailer |
| GET | /api/products | List products (filters: producer_id, category, search) |
| GET | /api/products/:id | Get product with listings |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/listings | List active listings (filters: producer, product, category, location, price) |
| GET | /api/listings/:id | Get listing details |
| POST | /api/listings | Create listing |
| PUT | /api/listings/:id | Update listing |
| DELETE | /api/listings/:id | Deactivate listing |
| GET | /api/orders | List orders (filters: producer_id, retailer_id, status) |
| GET | /api/orders/:id | Get order with details |
| POST | /api/orders | Create order (auto-creates match) |
| PUT | /api/orders/:id/status | Update order status |
| GET | /api/matches | List matches (filters: producer_id, retailer_id) |
| GET | /api/matches/:id | Get match with order history |
| GET | /api/search?q= | Full-text search across producers, products, listings |

## Database Tables

- **producers** — Farms, bakeries, artisans
- **retailers** — Grocery stores, markets, cafes
- **products** — Items produced by producers
- **listings** — Active sales offerings with pricing & availability
- **orders** — Purchase orders from retailers to producers
- **matches** — Producer-retailer relationships with order count & GMV