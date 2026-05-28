const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// GET /api/listings — List all active listings with filters
router.get('/', (req, res) => {
  try {
    const { producer_id, product_id, category, location, min_price, max_price } = req.query;
    let where = "l.active = 1";

    if (producer_id) where += ` AND l.producer_id = '${producer_id}'`;
    if (product_id) where += ` AND l.product_id = '${product_id}'`;
    if (category) where += ` AND p.category = '${category}'`;
    if (location) where += ` AND pr.location LIKE '%${location}%'`;
    if (min_price) where += ` AND l.price_per_unit >= ${min_price}`;
    if (max_price) where += ` AND l.price_per_unit <= ${max_price}`;

    const listings = db.query(`
      SELECT l.*, p.name as product_name, p.category as product_category,
             pr.name as producer_name, pr.location as producer_location
      FROM listings l
      JOIN products p ON p.id = l.product_id
      JOIN producers pr ON pr.id = l.producer_id
      WHERE ${where}
      ORDER BY l.created_at DESC
    `) || [];

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/listings/:id
router.get('/:id', (req, res) => {
  try {
    const listings = db.query(`
      SELECT l.*, p.name as product_name, p.category as product_category,
             pr.name as producer_name, pr.location as producer_location,
             pr.contact_email as producer_email, pr.contact_phone as producer_phone
      FROM listings l
      JOIN products p ON p.id = l.product_id
      JOIN producers pr ON pr.id = l.producer_id
      WHERE l.id = '${req.params.id}'
    `);
    if (!listings || listings.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(listings[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings
router.post('/', (req, res) => {
  try {
    const { product_id, producer_id, price_per_unit, min_order_quantity, available_quantity, unit, season_start, season_end } = req.body;

    if (!product_id || !producer_id || price_per_unit === undefined) {
      return res.status(400).json({ error: 'product_id, producer_id, and price_per_unit are required' });
    }

    // Verify the product exists and belongs to the producer
    const product = db.getById('products', product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.producer_id !== producer_id) {
      return res.status(400).json({ error: 'Product does not belong to this producer' });
    }

    const listing = db.insert('listings', {
      id: uuidv4(),
      product_id,
      producer_id,
      price_per_unit: parseFloat(price_per_unit),
      min_order_quantity: min_order_quantity ? parseFloat(min_order_quantity) : 1,
      available_quantity: available_quantity ? parseFloat(available_quantity) : 0,
      unit: unit || product.unit,
      season_start: season_start || null,
      season_end: season_end || null,
      active: 1,
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/listings/:id
router.put('/:id', (req, res) => {
  try {
    const existing = db.getById('listings', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Listing not found' });

    const allowed = ['price_per_unit', 'min_order_quantity', 'available_quantity', 'unit', 'season_start', 'season_end', 'active'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    // Parse numeric fields
    if (updates.price_per_unit) updates.price_per_unit = parseFloat(updates.price_per_unit);
    if (updates.min_order_quantity) updates.min_order_quantity = parseFloat(updates.min_order_quantity);
    if (updates.available_quantity) updates.available_quantity = parseFloat(updates.available_quantity);

    const updated = db.update('listings', req.params.id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/listings/:id — Deactivate a listing
router.delete('/:id', (req, res) => {
  try {
    const existing = db.getById('listings', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Listing not found' });

    db.update('listings', req.params.id, { active: 0 });
    res.json({ message: 'Listing deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;