// API routes for managing issues
const express = require('express');
const db = require('../db'); // Database connection pool
const {
  validateIssueInput,
  validateIdParam,
  handleValidationErrors
} = require('../middleware/validators'); // Import validation middleware

const router = express.Router();

// --- Route Handlers ---

// GET /api/issues - Get all issues
router.get('/', async (req, res) => {
  // Fetch all issues, ordered by creation date descending
  const { rows } = await db.query('SELECT * FROM issues ORDER BY created_at DESC');
  res.json(rows);
});

// GET /api/issues/:id - Get a single issue by ID
router.get('/:id',
  validateIdParam, // Validate the ID in the URL path
  handleValidationErrors, // Check for validation errors
  async (req, res) => {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (rows.length === 0) {
      // If no issue found, return 404
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(rows[0]); // Return the found issue
  }
);

// POST /api/issues - Create a new issue
router.post('/',
  validateIssueInput, // Validate the request body
  handleValidationErrors, // Check for validation errors
  async (req, res) => {
    // Use default values if status/priority aren't provided
    const { title, description, status = 'Open', priority = 'Medium' } = req.body;
    const { rows } = await db.query(
      'INSERT INTO issues (title, description, status, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, status, priority]
    );
    // Return 201 Created status with the new issue data
    res.status(201).json(rows[0]);
  }
);

// PUT /api/issues/:id - Update an existing issue
router.put('/:id',
  validateIdParam, // Validate ID
  validateIssueInput, // Validate body (allows partial updates implicitly)
  handleValidationErrors, // Check errors
  async (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    // Check if the issue exists first
    const existingIssueResult = await db.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (existingIssueResult.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    const existingIssue = existingIssueResult.rows[0];

    // Build the update query dynamically based on provided fields
    // Note: A more robust way might involve building the SET clause dynamically
    //       to only update fields that are actually present in req.body.
    //       This simple approach updates all fields, using existing value if new one isn't provided.
    const newTitle = title !== undefined ? title : existingIssue.title;
    const newDescription = description !== undefined ? description : existingIssue.description;
    const newStatus = status !== undefined ? status : existingIssue.status;
    const newPriority = priority !== undefined ? priority : existingIssue.priority;

    // Execute the update query
    // updated_at can be set automatically by a DB trigger or explicitly here
    const { rows } = await db.query(
      'UPDATE issues SET title = $1, description = $2, status = $3, priority = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [newTitle, newDescription, newStatus, newPriority, id]
    );
    res.json(rows[0]); // Return the updated issue
  }
);

// DELETE /api/issues/:id - Delete an issue
router.delete('/:id',
  validateIdParam, // Validate ID
  handleValidationErrors, // Check errors
  async (req, res) => {
    const { id } = req.params;
    // Attempt to delete and return the deleted row
    const result = await db.query('DELETE FROM issues WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      // If no rows were deleted, the issue wasn't found
      return res.status(404).json({ message: 'Issue not found' });
    }
    // Respond with success message and optionally the deleted issue data
    res.status(200).json({ message: 'Issue deleted successfully', deletedIssue: result.rows[0] });
    // Alternatively, send 204 No Content for DELETE success without a body
    // res.status(204).send();
  }
);

module.exports = router;