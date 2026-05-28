const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/search — Full-text search across producers, products, listings
router.get('/', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ producers: [], products: [], listings: [] });
    }

    const term = q.trim();

    // Search producers
    const producers = db.query(`
      SELECT id, name, type, location, description, 'producer' as result_type
      FROM producers
      WHERE active = 1 AND (name LIKE '%${term}%' OR description LIKE '%${term}%' OR location LIKE '%${term}%')
      LIMIT 20
    `) || [];

    // Search products
    const products = db.query(`
      SELECT p.id, p.name, p.category, p.description, pr.name as producer_name,
             'product' as result_type
      FROM products p
      JOIN producers pr ON pr.id = p.producer_id
      WHERE p.active = 1 AND (p.name LIKE '%${term}%' OR p.description LIKE '%${term}%')
      LIMIT 20
    `) || [];

    // Search listings (by product name, producer name, location)
    const listings = db.query(`
      SELECT l.id, p.name as product_name, pr.name as producer_name,
             l.price_per_unit, l.unit, pr.location,
             'listing' as result_type
      FROM listings l
      JOIN products p ON p.id = l.product_id
      JOIN producers pr ON pr.id = l.producer_id
      WHERE l.active = 1 AND (p.name LIKE '%${term}%' OR pr.name LIKE '%${term}%' OR pr.location LIKE '%${term}%')
      LIMIT 20
    `) || [];

    res.json({ producers, products, listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;