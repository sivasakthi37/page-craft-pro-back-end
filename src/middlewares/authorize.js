'use strict';

const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const User = require('../models/user.model');

/**
 * Middleware to handle role-based authorization
 * @param {Array} roles - Allowed roles for the current route (default: all roles)
 */
const authorize = (roles = User.roles) => (req, res, next) => {
    // Check if the user has the required role
    
    if (!roles.includes(req.user.role)) {
        return next(new APIError('Forbidden: Insufficient permissions', httpStatus.FORBIDDEN));
    }
    console.log("req.user.role", req.user.role);
    // Continue to the next middleware or route handler
    next();
};

module.exports = authorize;
