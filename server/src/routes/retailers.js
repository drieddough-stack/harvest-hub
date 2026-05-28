const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// GET /api/retailers — List all active retailers
router.get('/', (req, res) => {
  try {
    const { type, location, search } = req.query;
    let where = "active = 1";
    if (type) where += ` AND type = '${type}'`;
    if (location) where += ` AND location LIKE '%${location}%'`;
    if (search) where += ` AND (name LIKE '%${search}%' OR description LIKE '%${search}%')`;
    const retailers = db.list('retailers', where);
    res.json(retailers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/retailers/:id
router.get('/:id', (req, res) => {
  try {
    const retailer = db.getById('retailers', req.params.id);
    if (!retailer) return res.status(404).json({ error: 'Retailer not found' });

    const orders = db.list('orders', `retailer_id = '${req.params.id}'`);
    const matches = db.list('matches', `retailer_id = '${req.params.id}' AND active = 1`);

    res.json({ ...retailer, orders, matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/retailers
router.post('/', (req, res) => {
  try {
    const { name, type, description, location, contact_email, contact_phone, website } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const retailer = db.insert('retailers', {
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
    res.status(201).json(retailer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/retailers/:id
router.put('/:id', (req, res) => {
  try {
    const existing = db.getById('retailers', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Retailer not found' });

    const allowed = ['name', 'type', 'description', 'location', 'contact_email', 'contact_phone', 'website', 'verified'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const updated = db.update('retailers', req.params.id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/retailers/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.getById('retailers', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Retailer not found' });

    db.softDelete('retailers', req.params.id);
    res.json({ message: 'Retailer deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;