// backend/controllers/auth.controller.js
const User = require('../models/user.model');
const httpStatus = require('http-status');
const bcrypt = require('bcrypt-nodejs');

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

/**
 * Get all users (admin-only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Retrieve all users, excluding sensitive fields like password
    const users = await User.find({}).select('-password -__v');
    
    res.status(200).json(
     users.map(user => user.transform())
    );
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

/**
 * Update user details (admin-only)
 */
exports.updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Prevent updating certain sensitive fields
    const forbiddenFields = ['password', '_id', 'email'];
    forbiddenFields.forEach(field => {
      if (updateData[field]) {
        delete updateData[field];
      }
    });

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User details updated successfully',
      user: user.transform()
    });
  } catch (error) {
    console.error('Update user details error:', error);
    res.status(500).json({ message: 'Failed to update user details' });
  }
};

/**
 * Reset user password (Super Admin only)
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Validate password strength (example validation)
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set new password
    user.password = newPassword; // Pre-save middleware will hash the password
    await user.save();

    res.status(200).json({
      message: 'User password reset successfully',
      userId: user._id
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

/**
 * Update user role (Super Admin only)
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role',
        validRoles 
      });
    }

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId, 
      { role }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User role updated successfully',
      user: user.transform()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

/**
 * Update user status (Super Admin only)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses 
      });
    }

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User status updated successfully',
      user: user.transform()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

/**
 * Get user details by ID
 * Accessible to authenticated users and admins
 */
exports.getUserDetailsById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by ID and exclude sensitive fields
    const user = await User.findById(userId)
      .select('-password -__v')
      .lean(); // Use lean for better performance

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user details
    res.status(200).json({
      message: 'User details retrieved successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Failed to retrieve user details' });
  }
};
