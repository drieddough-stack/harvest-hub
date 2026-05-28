-- Seed data for LocalConnect

-- Producers
INSERT INTO producers (id, name, type, description, location, contact_email) VALUES
('p1', 'Sunny Farms', 'farm', 'Organic vegetables and fruits from the valley.', 'Green Valley', 'info@sunnyfarms.com'),
('p2', 'Artisan Bakery', 'bakery', 'Hand-crafted sourdough and pastries.', 'Old Town', 'hello@artisanbakery.com'),
('p3', 'Mountain Dairy', 'farm', 'Fresh milk, cheese, and yogurt.', 'Highlands', 'contact@mountaindairy.com');

-- Retailers
INSERT INTO retailers (id, name, type, description, location, contact_email) VALUES
('r1', 'City Co-op', 'co-op', 'Community-owned grocery store.', 'Downtown', 'buyer@citycoop.com'),
('r2', 'The Corner Cafe', 'cafe', 'Specialty coffee and local eats.', 'Westside', 'manager@cornercafe.com');

-- Products
INSERT INTO products (id, producer_id, name, category, description, unit) VALUES
('pr1', 'p1', 'Organic Carrots', 'produce', 'Crunchy orange carrots.', 'lb'),
('pr2', 'p1', 'Strawberries', 'produce', 'Sweet summer strawberries.', 'lb'),
('pr3', 'p2', 'Sourdough Loaf', 'bakery', 'Traditional 24-hour ferment.', 'each'),
('pr4', 'p3', 'Cheddar Cheese', 'dairy', 'Aged 12 months.', 'lb');

-- Listings
INSERT INTO listings (id, product_id, producer_id, price_per_unit, min_order_quantity, available_quantity, unit) VALUES
('l1', 'pr1', 'p1', 1.50, 10, 100, 'lb'),
('l2', 'pr2', 'p1', 4.00, 5, 50, 'lb'),
('l3', 'pr3', 'p2', 6.50, 1, 20, 'each'),
('l4', 'pr4', 'p3', 12.00, 2, 30, 'lb');
