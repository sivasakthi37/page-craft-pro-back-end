// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const httpStatus = require('http-status');
const uuidv1 = require('uuid/v1');

const roles = ['user', 'admin']; // Updated roles
const userStatuses = ['active', 'banned']; // New statuses

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: roles,
      default: 'user'
    }, // Role-based access control
    status: {
      type: String,
      enum: userStatuses,
      default: 'active'
    },
    subscriptionStatus: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free'
    },
    subscriptionExpiry: { type: Date, default: null },
    activationKey: { type: String, required: false }, // Add this field
    pageCount: { 
      type: Number, 
      default: 0,
      max: [10, 'Free users can only create up to 10 pages']
    }
  },
  { timestamps: true }
);

// Pre-save middleware to hash the password
userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password);
  next();
});

// Method to compare passwords
userSchema.methods.passwordMatches = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Method to transform user data
userSchema.methods.transform = function () {
  const transformed = {};
  const fields = [
    'id', 
    'username', 
    'email', 
    'role', 
    'status',
    'subscriptionStatus', 
    'subscriptionExpiry', 
    'pageCount',
    'createdAt'
  ];
  fields.forEach((field) => {
    transformed[field] = this[field];
  });
  return transformed;
};

// Static method for checking duplicates and errors
userSchema.statics.checkDuplicateEmailError = function (err) {
  if (err.code === 11000) {
    const error = new Error('Email already taken');
    error.errors = [{
      field: 'email',
      location: 'body',
      messages: ['Email already taken']
    }];
    error.status = httpStatus.CONFLICT;
    return error;
  }
  return err;
};

// Static method for generating token and handling login
userSchema.statics.findAndGenerateToken = async function (payload) {
  const { email, password } = payload;
  if (!email) throw new Error('Email must be provided for login');

  const user = await this.findOne({ email }).exec();
  if (!user) throw new Error(`No user associated with ${email}`, httpStatus.NOT_FOUND);

  const passwordOK = await user.passwordMatches(password);
  if (!passwordOK) throw new Error('Password mismatch', httpStatus.UNAUTHORIZED);

  return user;
};

module.exports = mongoose.model('User', userSchema);
