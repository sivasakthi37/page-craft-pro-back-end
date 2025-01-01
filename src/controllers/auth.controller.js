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

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(httpStatus.FORBIDDEN).json({ 
        message: 'Your account has been banned. Please contact support for further assistance.' 
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '8h' });

    // Send the response with the token
    res.status(httpStatus.OK).send({ user: user.transform(), token });
  } catch (error) {
    next(error);
  }
};
