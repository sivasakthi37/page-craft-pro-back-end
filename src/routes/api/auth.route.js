'use strict'

const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/authorization');
const authorize = require('../../middlewares/authorize');
const validator = require('express-validation');
const { register, login, updateSubscription, getSubscriptionStatus } = require('../../validations/user.validation');

// User registration
router.post('/register', validator(register), authController.register);

// User login
router.post('/login', validator(login), authController.login);

// Update user subscription route
router.put('/update-subscription', auth, validator(updateSubscription), authController.updateUserSubscription);

// Get user subscription status route
router.post('/subscription/status', auth, validator(getSubscriptionStatus), authController.getUserSubscriptionStatus);

module.exports = router
