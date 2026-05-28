-- LocalConnect Database Schema
-- This schema is applied via the team-db CLI.
-- Run: team-db "$(cat server/src/schema.sql)"

CREATE TABLE IF NOT EXISTS producers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'other' CHECK(type IN ('farm', 'bakery', 'artisan', 'other')),
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    contact_email TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    website TEXT DEFAULT '',
    verified INTEGER DEFAULT 0 CHECK(verified IN (0,1)),
    active INTEGER DEFAULT 1 CHECK(active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS retailers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'other' CHECK(type IN ('grocery', 'market', 'cafe', 'co-op', 'other')),
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    contact_email TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    website TEXT DEFAULT '',
    verified INTEGER DEFAULT 0 CHECK(verified IN (0,1)),
    active INTEGER DEFAULT 1 CHECK(active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    producer_id TEXT NOT NULL REFERENCES producers(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('produce', 'dairy', 'bakery', 'beverage', 'meat', 'preserved', 'other')),
    description TEXT DEFAULT '',
    unit TEXT NOT NULL DEFAULT 'each',
    active INTEGER DEFAULT 1 CHECK(active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    producer_id TEXT NOT NULL REFERENCES producers(id),
    price_per_unit REAL NOT NULL CHECK(price_per_unit > 0),
    min_order_quantity REAL DEFAULT 1 CHECK(min_order_quantity > 0),
    available_quantity REAL DEFAULT 0 CHECK(available_quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'each',
    season_start TEXT,
    season_end TEXT,
    active INTEGER DEFAULT 1 CHECK(active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL REFERENCES listings(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    producer_id TEXT NOT NULL REFERENCES producers(id),
    retailer_id TEXT NOT NULL REFERENCES retailers(id),
    quantity REAL NOT NULL CHECK(quantity > 0),
    total_price REAL NOT NULL CHECK(total_price > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    producer_id TEXT NOT NULL REFERENCES producers(id),
    retailer_id TEXT NOT NULL REFERENCES retailers(id),
    first_order_id TEXT REFERENCES orders(id),
    total_orders INTEGER DEFAULT 1 CHECK(total_orders >= 1),
    total_gmv REAL DEFAULT 0 CHECK(total_gmv >= 0),
    active INTEGER DEFAULT 1 CHECK(active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(producer_id, retailer_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_producer ON products(producer_id);
CREATE INDEX IF NOT EXISTS idx_listings_product ON listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_producer ON listings(producer_id);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(active);
CREATE INDEX IF NOT EXISTS idx_orders_producer ON orders(producer_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_matches_producer ON matches(producer_id);
CREATE INDEX IF NOT EXISTS idx_matches_retailer ON matches(retailer_id);