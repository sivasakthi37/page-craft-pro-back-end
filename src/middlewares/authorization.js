'use strict';

const jwt = require('jsonwebtoken');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const config = require('../config'); // Ensure you have a config file with JWT secret

/**
 * Middleware to authenticate and verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateJWT = (req, res, next) => {
  // Check if the Authorization header is present
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new APIError('No token provided', httpStatus.UNAUTHORIZED));
  }

  // Verify the token using the secret key
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return next(new APIError('Invalid or expired token', httpStatus.UNAUTHORIZED));
    }

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  });
};

module.exports = authenticateJWT;
