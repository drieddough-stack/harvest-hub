const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/matches — List all active matches
router.get('/', (req, res) => {
  try {
    const { producer_id, retailer_id } = req.query;
    let where = "m.active = 1";
    if (producer_id) where += ` AND m.producer_id = '${producer_id}'`;
    if (retailer_id) where += ` AND m.retailer_id = '${retailer_id}'`;

    const matches = db.query(`
      SELECT m.*,
             pr.name as producer_name, pr.location as producer_location,
             r.name as retailer_name, r.location as retailer_location
      FROM matches m
      JOIN producers pr ON pr.id = m.producer_id
      JOIN retailers r ON r.id = m.retailer_id
      WHERE ${where}
      ORDER BY m.total_gmv DESC
    `) || [];

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/matches/:id
router.get('/:id', (req, res) => {
  try {
    const matches = db.query(`
      SELECT m.*,
             pr.name as producer_name, pr.location as producer_location,
             pr.contact_email as producer_email,
             r.name as retailer_name, r.location as retailer_location,
             r.contact_email as retailer_email
      FROM matches m
      JOIN producers pr ON pr.id = m.producer_id
      JOIN retailers r ON r.id = m.retailer_id
      WHERE m.id = '${req.params.id}'
    `);
    if (!matches || matches.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Get orders for this match
    const match = matches[0];
    const orders = db.list('orders',
      `producer_id = '${match.producer_id}' AND retailer_id = '${match.retailer_id}'`
    );

    res.json({ ...match, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;