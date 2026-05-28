const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// GET /api/products — List all active products
router.get('/', (req, res) => {
  try {
    const { producer_id, category, search } = req.query;
    let where = "p.active = 1";
    if (producer_id) where += ` AND p.producer_id = '${producer_id}'`;
    if (category) where += ` AND p.category = '${category}'`;
    if (search) where += ` AND (p.name LIKE '%${search}%' OR p.description LIKE '%${search}%')`;

    const products = db.query(`
      SELECT p.*, pr.name as producer_name, pr.location as producer_location
      FROM products p
      JOIN producers pr ON pr.id = p.producer_id
      WHERE ${where}
      ORDER BY p.created_at DESC
    `) || [];

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const products = db.query(`
      SELECT p.*, pr.name as producer_name, pr.location as producer_location
      FROM products p
      JOIN producers pr ON pr.id = p.producer_id
      WHERE p.id = '${req.params.id}'
    `);
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const listings = db.list('listings', `product_id = '${req.params.id}' AND active = 1`);
    res.json({ ...products[0], listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', (req, res) => {
  try {
    const { producer_id, name, category, description, unit } = req.body;
    if (!producer_id || !name) {
      return res.status(400).json({ error: 'producer_id and name are required' });
    }

    // Verify the producer exists
    const producer = db.getById('producers', producer_id);
    if (!producer) return res.status(404).json({ error: 'Producer not found' });

    const product = db.insert('products', {
      id: uuidv4(),
      producer_id,
      name,
      category: category || 'other',
      description: description || '',
      unit: unit || 'each',
      active: 1,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  try {
    const existing = db.getById('products', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const allowed = ['name', 'category', 'description', 'unit', 'active'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const updated = db.update('products', req.params.id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.getById('products', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.hardDelete('products', req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;