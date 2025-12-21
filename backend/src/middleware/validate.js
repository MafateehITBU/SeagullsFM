import { validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Validation rules for SuperAdmin
export const superAdminValidation = {
  // Register validation
  register: [
    {
      name: 'name',
      rules: [
        { type: 'notEmpty', message: 'Name is required' },
        { type: 'isLength', options: { min: 2, max: 50 }, message: 'Name must be between 2 and 50 characters' }
      ]
    },
    {
      name: 'email',
      rules: [
        { type: 'notEmpty', message: 'Email is required' },
        { type: 'isEmail', message: 'Please enter a valid email' }
      ]
    },
    {
      name: 'password',
      rules: [
        { type: 'notEmpty', message: 'Password is required' },
        { type: 'isLength', options: { min: 6 }, message: 'Password must be at least 6 characters' }
      ]
    },
    {
      name: 'phoneNumber',
      rules: [
        { type: 'notEmpty', message: 'Phone number is required' },
        { type: 'matches', options: /^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, message: 'Please enter a valid phone number' }
      ]
    }
  ],

  // Login validation
  login: [
    {
      name: 'email',
      rules: [
        { type: 'notEmpty', message: 'Email is required' },
        { type: 'isEmail', message: 'Please enter a valid email' }
      ]
    },
    {
      name: 'password',
      rules: [
        { type: 'notEmpty', message: 'Password is required' }
      ]
    }
  ],

  // Update validation
  update: [
    {
      name: 'name',
      rules: [
        { type: 'optional' },
        { type: 'isLength', options: { min: 2, max: 50 }, message: 'Name must be between 2 and 50 characters' }
      ]
    },
    {
      name: 'email',
      rules: [
        { type: 'optional' },
        { type: 'isEmail', message: 'Please enter a valid email' }
      ]
    },
    {
      name: 'phoneNumber',
      rules: [
        { type: 'optional' },
        { type: 'matches', options: /^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, message: 'Please enter a valid phone number' }
      ]
    }
  ]
};

