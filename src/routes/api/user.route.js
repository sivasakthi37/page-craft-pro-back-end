'use strict'

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const auth = require('../../middlewares/authorization');
const authorize = require('../../middlewares/authorize');
const validator = require('express-validation');
const { updateSubscription, getSubscriptionStatus } = require('../../validations/user.validation');

// Update user subscription route
router.put('/update-subscription', auth, validator(updateSubscription), authorize(['user', 'admin']), userController.updateUserSubscription);

// Get user subscription status route
router.post('/subscription/status', auth, validator(getSubscriptionStatus), authorize(['user', 'admin']), userController.getUserSubscriptionStatus);

// Get all users (admin-only)
router.get('/', auth, authorize(['admin']), userController.getAllUsers);

// Update user details (admin-only)
router.put('/:userId', auth, authorize(['admin',]), userController.updateUserDetails);

// Super Admin specific routes
// Reset user password
router.post('/reset-password/:userId', auth, authorize(['admin']), userController.resetUserPassword);

// Manage user role
router.put('/role/:userId', auth, authorize(['admin']), userController.updateUserRole);

// Disable/ban user
router.put('/status/:userId', auth, authorize(['admin']), userController.updateUserStatus);

// Get user details by ID (accessible to authenticated users)
router.get('/:userId/details', auth, authorize(['user', 'admin']), userController.getUserDetailsById);

module.exports = router
