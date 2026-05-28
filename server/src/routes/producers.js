const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// GET /api/producers — List all active producers
router.get('/', (req, res) => {
  try {
    const { type, location, search } = req.query;
    let where = "active = 1";
    if (type) where += ` AND type = '${type}'`;
    if (location) where += ` AND location LIKE '%${location}%'`;
    if (search) where += ` AND (name LIKE '%${search}%' OR description LIKE '%${search}%')`;
    const producers = db.list('producers', where);
    res.json(producers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/producers/:id — Get producer with products and listings
router.get('/:id', (req, res) => {
  try {
    const producer = db.getById('producers', req.params.id);
    if (!producer) return res.status(404).json({ error: 'Producer not found' });

    const products = db.list('products', `producer_id = '${req.params.id}' AND active = 1`);
    const listings = db.list('listings', `producer_id = '${req.params.id}' AND active = 1`);

    res.json({ ...producer, products, listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/producers — Create a producer
router.post('/', (req, res) => {
  try {
    const { name, type, description, location, contact_email, contact_phone, website } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const producer = db.insert('producers', {
      id: uuidv4(),
      name,
      type: type || 'other',
      description: description || '',
      location: location || '',
      contact_email: contact_email || '',
      contact_phone: contact_phone || '',
      website: website || '',
      verified: 0,
      active: 1,
    });
    res.status(201).json(producer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/producers/:id — Update a producer
router.put('/:id', (req, res) => {
  try {
    const existing = db.getById('producers', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Producer not found' });

    const allowed = ['name', 'type', 'description', 'location', 'contact_email', 'contact_phone', 'website', 'verified'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const updated = db.update('producers', req.params.id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/producers/:id — Soft-delete a producer
router.delete('/:id', (req, res) => {
  try {
    const existing = db.getById('producers', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Producer not found' });

    db.softDelete('producers', req.params.id);
    res.json({ message: 'Producer deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;