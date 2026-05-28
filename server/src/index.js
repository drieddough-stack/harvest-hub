/**
 * Harvest Hub — Backend API Server
 * Express.js REST API on port 3001
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { initDb } = require('./init');

// Initialize database on startup
initDb();

// Route imports
const producersRouter = require('./routes/producers');
const retailersRouter = require('./routes/retailers');
const productsRouter = require('./routes/products');
const listingsRouter = require('./routes/listings');
const ordersRouter = require('./routes/orders');
const matchesRouter = require('./routes/matches');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/producers', producersRouter);
app.use('/api/retailers', retailersRouter);
app.use('/api/products', productsRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/search', searchRouter);

// Serve production frontend
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA catch-all — serve index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Harvest Hub API server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;