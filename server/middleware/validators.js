// Input validation rules
const { body, param, validationResult } = require('express-validator');

// Validation rules for creating/updating an issue
const validateIssueInput = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters.'),
  body('description')
    .optional({ checkFalsy: true }) // Makes description optional
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters.'),
  body('status')
    .optional() // Status is optional on create/update (defaults handled in route)
    .trim()
    .isIn(['Open', 'In Progress', 'Closed']).withMessage('Invalid status value.'),
  body('priority')
    .optional() // Priority is optional on create/update (defaults handled in route)
    .trim()
    .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority value.'),
];

// Validation rule for the ID parameter in routes like /issues/:id
const validateIdParam = [
  param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer.'),
];

// Middleware function to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If errors exist, return 400 Bad Request with the error details
    return res.status(400).json({ errors: errors.array() });
  }
  // If no errors, proceed to the next middleware/route handler
  next();
};

module.exports = {
  validateIssueInput,
  validateIdParam,
  handleValidationErrors,
};