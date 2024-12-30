'use strict'

const Joi = require('joi');

// User validation rules
module.exports = {
  // For user registration
  register: {
    body: {
      username: Joi.string().max(50).required(), // Username is required and max 50 chars
      email: Joi.string().email().required(), // Email should be valid
      password: Joi.string().min(6).max(128).required(), // Password should be between 6 and 128 chars
      role: Joi.string().valid('user', 'admin').default('user'), // Role-based access
      subscriptionStatus: Joi.string().valid('free', 'paid').default('free'), // Default subscription status
      subscriptionExpiry: Joi.date().allow(null), // Subscription expiry (null if not set)
    }
  },

  // For user login
  login: {
    body: {
      email: Joi.string().email().required(), // Email is required
      password: Joi.string().min(6).max(128).required(), // Password should be between 6 and 128 chars
    }
  },

  // For updating subscription
  updateSubscription: {
    body: {
      userId: Joi.string().required(), // User ID is required
      subscriptionStatus: Joi.string().valid('free', 'paid').required(), // Subscription status
      subscriptionExpiry: Joi.date().allow(null) // Subscription expiry (optional)
    }
  },

  // For getting subscription status
  getSubscriptionStatus: {
    body: {
      userId: Joi.string().required(), // User ID is required
    }
  }
};
