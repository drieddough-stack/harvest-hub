const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// GET /api/orders — List orders with filters
router.get('/', (req, res) => {
  try {
    const { producer_id, retailer_id, status } = req.query;
    let where = "1=1";
    if (producer_id) where += ` AND o.producer_id = '${producer_id}'`;
    if (retailer_id) where += ` AND o.retailer_id = '${retailer_id}'`;
    if (status) where += ` AND o.status = '${status}'`;

    const orders = db.query(`
      SELECT o.*, 
             p.name as product_name, pr.name as producer_name,
             r.name as retailer_name
      FROM orders o
      JOIN products p ON p.id = o.product_id
      JOIN producers pr ON pr.id = o.producer_id
      JOIN retailers r ON r.id = o.retailer_id
      WHERE ${where}
      ORDER BY o.created_at DESC
    `) || [];

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  try {
    const orders = db.query(`
      SELECT o.*,
             p.name as product_name, p.category as product_category,
             pr.name as producer_name, pr.location as producer_location,
             r.name as retailer_name, r.location as retailer_location
      FROM orders o
      JOIN products p ON p.id = o.product_id
      JOIN producers pr ON pr.id = o.producer_id
      JOIN retailers r ON r.id = o.retailer_id
      WHERE o.id = '${req.params.id}'
    `);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(orders[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — Create an order (auto-creates match if first order)
router.post('/', (req, res) => {
  try {
    const { listing_id, retailer_id, quantity, notes } = req.body;

    if (!listing_id || !retailer_id || !quantity) {
      return res.status(400).json({ error: 'listing_id, retailer_id, and quantity are required' });
    }

    // Get the listing with product info
    const listings = db.query(`
      SELECT l.*, p.producer_id as product_producer_id, p.name as product_name
      FROM listings l
      JOIN products p ON p.id = l.product_id
      WHERE l.id = '${listing_id}' AND l.active = 1
    `);

    if (!listings || listings.length === 0) {
      return res.status(404).json({ error: 'Active listing not found' });
    }

    const listing = listings[0];

    // Verify retailer exists
    const retailer = db.getById('retailers', retailer_id);
    if (!retailer) return res.status(404).json({ error: 'Retailer not found' });

    const qty = parseFloat(quantity);
    const total_price = qty * listing.price_per_unit;

    // Create order
    const orderId = uuidv4();
    const order = db.insert('orders', {
      id: orderId,
      listing_id: listing.id,
      product_id: listing.product_id,
      producer_id: listing.product_producer_id,
      retailer_id,
      quantity: qty,
      total_price,
      status: 'pending',
      notes: notes || '',
    });

    // Auto-create or update match
    const existingMatches = db.list('matches',
      `producer_id = '${listing.product_producer_id}' AND retailer_id = '${retailer_id}'`
    );

    if (existingMatches && existingMatches.length > 0) {
      // Update existing match
      const match = existingMatches[0];
      db.update('matches', match.id, {
        total_orders: match.total_orders + 1,
        total_gmv: match.total_gmv + total_price,
      });
    } else {
      // Create new match
      db.insert('matches', {
        id: uuidv4(),
        producer_id: listing.product_producer_id,
        retailer_id,
        first_order_id: orderId,
        total_orders: 1,
        total_gmv: total_price,
        active: 1,
      });
    }

    // Update available quantity
    const newAvailable = Math.max(0, listing.available_quantity - qty);
    db.update('listings', listing.id, { available_quantity: newAvailable });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status — Update order status
router.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = db.getById('orders', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    const updated = db.update('orders', req.params.id, { status });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;