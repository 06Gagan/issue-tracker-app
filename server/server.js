require('dotenv').config();
require('express-async-errors');

const express = require('express');
const morgan = require('morgan'); // HTTP request logger
const cors = require('cors'); // Enable Cross-Origin Resource Sharing
const db = require('./db'); // Database connection pool
const issueRoutes = require('./routes/issues'); // API routes for issues

const app = express();

app.use(cors()); // Allow requests from frontend 
app.use(morgan('dev')); // Log requests in dev format
app.use(express.json()); // Parse incoming JSON request bodies

// --- API Routes ---
app.use('/api/issues', issueRoutes); // Mount issue routes

// --- Basic Routes (for  testing) ---
app.get('/', (req, res) => {
  res.send('Issue Tracker Backend Running!');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()'); // Test DB connection
    res.json({ message: 'Database connection successful!', time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});


// --- Centralized Error Handler ---
// This middleware catches errors passed via next(err) or thrown in async routes
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  if (res.headersSent) {
    return next(err);
  }

  // Default to 500 Internal Server Error if no status is set on the error
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: { message: message },
    // Optionally include stack trace in dev environment
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});


// --- Start Server ---
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});