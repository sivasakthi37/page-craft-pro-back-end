// backend/controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config');
const httpStatus = require('http-status');
const uuidv1 = require('uuid/v1');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const activationKey = uuidv1();
    const { username, email, password, role } = req.body;
    console.log("activationKey", activationKey);
    const user = new User({
      username,
      email,
      password,
      role,
      activationKey
    });

    const savedUser = await user.save();

    // Respond with the created user data
    res.status(httpStatus.CREATED).send(savedUser.transform());

    // Here you can send an activation email to the user using a mail service
    // Send email logic can go here.

  } catch (error) {
    console.log("error", error);
    next(User.checkDuplicateEmailError(error));
  }
};

// Login user and generate JWT token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req.body", req.body);
    const user = await User.findAndGenerateToken({ email, password });

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '8h' });

    // Send the response with the token
    res.status(httpStatus.OK).send({ user: user.transform(), token });
  } catch (error) {
    next(error);
  }
};

// Activate user account (after clicking on activation link)
exports.activate = async (req, res, next) => {
  try {
    const { key } = req.query;

    const user = await User.findOne({ activationKey: key });

    if (!user) {
      throw new Error('Invalid activation link');
    }

    user.active = true;
    await user.save();

    res.status(httpStatus.OK).send({ message: 'Account activated successfully' });
  } catch (error) {
    next(error);
  }
};

// // Update subscription status
// exports.updateSubscription = async (req, res, next) => {
//   try {
//     const { userId, subscriptionStatus, subscriptionExpiry } = req.body;

//     const user = await User.findById(userId);

//     if (!user) {
//       throw new Error('User not found');
//     }

//     user.subscriptionStatus = subscriptionStatus;
//     user.subscriptionExpiry = subscriptionExpiry || null;

//     await user.save();

//     res.status(httpStatus.OK).send(user.transform());
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * Update user subscription
 */
exports.updateUserSubscription = async (req, res) => {
  try {
    const { userId, subscriptionStatus, subscriptionExpiry } = req.body;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's subscription
    user.subscriptionStatus = subscriptionStatus;
    
    // Set subscription expiry if provided, otherwise set to one month from now for 'paid'
    if (subscriptionStatus === 'paid') {
      user.subscriptionExpiry = subscriptionExpiry || (() => {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        return expiry;
      })();
    } else {
      // Clear expiry for free subscription
      user.subscriptionExpiry = null;
    }

    // Save the updated user
    await user.save();

    // Return updated user details
    res.status(200).json({
      message: 'Subscription updated successfully',
      user: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry
      }
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
};

/**
 * Get user subscription status and user data
 */
exports.getUserSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required in request body' 
      });
    }

    // Find the user and select specific fields
    const user = await User.findById(userId).select(
      'username email subscriptionStatus subscriptionExpiry role'
    );

    // If user not found
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Prepare response
    const response = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry
      }
    };

    // Check if subscription is expired
    if (user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
      response.user.subscriptionStatus = 'expired';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve user subscription status',
      error: error.message 
    });
  }
};
