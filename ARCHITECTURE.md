# Harvest Hub — System Architecture

## Overview

Harvest Hub is a matchmaking platform connecting local producers (farms, bakeries, artisans) with retailers (grocery stores, markets, cafes). The platform facilitates discovery, ordering, and logistics coordination between producers and retailers.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Vite + React | Lightweight, fast dev server, minimal memory |
| Backend | Node.js + Express | Simple REST API, low overhead |
| Database | SQLite (via `team-db` CLI) | Zero-config, file-based, no separate server |

## Project Structure

```
/home/team/shared/localconnect/
├── ARCHITECTURE.md           # This document
├── README.md                 # Project overview & setup
├── server/                   # Express backend (port 3001)
│   ├── package.json
│   └── src/
│       ├── index.js          # Entry point, Express app setup
│       ├── db.js             # team-db CLI wrapper
│       ├── schema.sql        # Database schema DDL
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── validation.js
│       └── routes/
│           ├── producers.js  # CRUD for producers
│           ├── retailers.js  # CRUD for retailers
│           ├── products.js   # CRUD for products
│           ├── listings.js   # Product listings with availability
│           ├── orders.js     # Order management
│           ├── matches.js    # Match tracking
│           └── search.js     # Search & discovery
├── client/                   # Vite + React frontend (port 5173)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── api/
│       │   └── client.js     # Axios/fetch wrapper
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Producers.jsx
│       │   ├── Retailers.jsx
│       │   ├── Products.jsx
│       │   ├── Listings.jsx
│       │   ├── Orders.jsx
│       │   └── Matches.jsx
│       └── components/
│           ├── Layout.jsx
│           ├── Navbar.jsx
│           └── Footer.jsx
└── dev.sh                    # One-command dev startup
```

## Database Schema

### Entity-Relationship

```
Producers ──1:N──> Products ──1:N──> Listings ──N:1── Retailers
                    ↑                                   ↑
                    └──────── Orders ────────────────────┘
                                    
                           Matches (producer + retailer pair + first order date)
```

### Tables

#### `producers`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| name | TEXT | Business name |
| type | TEXT | farm, bakery, artisan, other |
| description | TEXT | Bio / about |
| location | TEXT | City/region |
| contact_email | TEXT | |
| contact_phone | TEXT | |
| website | TEXT | Optional |
| verified | INTEGER (0/1) | Verification status |
| created_at | TEXT (ISO8601) | |
| updated_at | TEXT (ISO8601) | |

#### `retailers`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| name | TEXT | Store/business name |
| type | TEXT | grocery, market, cafe, co-op, other |
| description | TEXT | |
| location | TEXT | City/region |
| contact_email | TEXT | |
| contact_phone | TEXT | |
| website | TEXT | Optional |
| verified | INTEGER (0/1) | |
| created_at | TEXT (ISO8601) | |
| updated_at | TEXT (ISO8601) | |

#### `products`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| producer_id | TEXT (UUID) | FK → producers.id |
| name | TEXT | Product name |
| category | TEXT | produce, dairy, bakery, beverage, meat, preserved, other |
| description | TEXT | |
| unit | TEXT | lb, each, dozen, gallon, etc. |
| created_at | TEXT (ISO8601) | |
| updated_at | TEXT (ISO8601) | |

#### `listings`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| product_id | TEXT (UUID) | FK → products.id |
| producer_id | TEXT (UUID) | FK → producers.id |
| price_per_unit | REAL | |
| min_order_quantity | REAL | |
| available_quantity | REAL | Current available stock |
| unit | TEXT | |
| season_start | TEXT | Optional seasonal availability |
| season_end | TEXT | |
| active | INTEGER (0/1) | Whether listing is live |
| created_at | TEXT (ISO8601) | |
| updated_at | TEXT (ISO8601) | |

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| listing_id | TEXT (UUID) | FK → listings.id |
| product_id | TEXT (UUID) | FK → products.id |
| producer_id | TEXT (UUID) | FK → producers.id |
| retailer_id | TEXT (UUID) | FK → retailers.id |
| quantity | REAL | |
| total_price | REAL | |
| status | TEXT | pending, confirmed, shipped, delivered, cancelled |
| notes | TEXT | Optional delivery notes |
| created_at | TEXT (ISO8601) | |
| updated_at | TEXT (ISO8601) | |

#### `matches`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| producer_id | TEXT (UUID) | FK → producers.id |
| retailer_id | TEXT (UUID) | FK → retailers.id |
| first_order_id | TEXT (UUID) | FK → orders.id (the order that created the match) |
| total_orders | INTEGER | Count of repeat orders |
| total_gmv | REAL | Cumulative GMV |
| active | INTEGER (0/1) | Whether relationship is active |
| created_at | TEXT (ISO8601) | |
| updated_at | TEXT (ISO8601) | |

## API Routes

All routes are prefixed with `/api`.

### Producers
- `GET /api/producers` — List all producers (with search/filter query params)
- `GET /api/producers/:id` — Get producer details (includes their products and listings)
- `POST /api/producers` — Create a producer
- `PUT /api/producers/:id` — Update a producer
- `DELETE /api/producers/:id` — Soft-delete (set active=0) a producer

### Retailers
- `GET /api/retailers` — List all retailers
- `GET /api/retailers/:id` — Get retailer details
- `POST /api/retailers` — Create a retailer
- `PUT /api/retailers/:id` — Update a retailer
- `DELETE /api/retailers/:id` — Soft-delete a retailer

### Products
- `GET /api/products` — List all products (filterable by producer_id, category)
- `GET /api/products/:id` — Get product details (includes listings)
- `POST /api/products` — Create a product (requires producer_id)
- `PUT /api/products/:id` — Update a product
- `DELETE /api/products/:id` — Delete a product

### Listings
- `GET /api/listings` — List all active listings (with filters: producer_id, category, location)
- `GET /api/listings/:id` — Get listing details
- `POST /api/listings` — Create a listing
- `PUT /api/listings/:id` — Update a listing
- `DELETE /api/listings/:id` — Deactivate a listing

### Orders
- `GET /api/orders` — List all orders (filterable by producer_id, retailer_id, status)
- `GET /api/orders/:id` — Get order details
- `POST /api/orders` — Create an order (auto-creates match if first order between pair)
- `PUT /api/orders/:id/status` — Update order status

### Matches
- `GET /api/matches` — List all matches
- `GET /api/matches/:id` — Get match details

### Search
- `GET /api/search` — Full-text search across producers, products, listings

## Data Flow

1. **Producer Onboarding**: Producer signs up → creates profile → adds products → creates listings
2. **Retailer Discovery**: Retailer browses/searchs listings → views producer profiles → finds what they need
3. **Order Placement**: Retailer places order → system: (a) creates order record, (b) checks if match exists, (c) creates match if first order
4. **Order Fulfillment**: Producer confirms → ships → retailer receives → status updated
5. **Match Tracking**: Each unique producer-retailer pair gets a match record tracking order count & GMV

## Development Plan

1. ✅ Scaffold project structure
2. ✅ Set up database schema (run schema.sql)
3. ✅ Build Express server with all routes
4. ✅ Build React frontend with pages and navigation
5. 🚧 Test end-to-end flow
6. 🚧 Deploy and verify

## Memory & Performance Notes

- Use `--max-old-space-size=512` for Node processes
- Vite dev server starts on port 5173, Express on port 3001
- Keep SQL queries simple — SQLite handles this fine for small/medium datasets
- Frontend proxies `/api` requests to Express in dev mode