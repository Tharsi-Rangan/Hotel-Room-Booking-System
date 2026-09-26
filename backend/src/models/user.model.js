/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usersSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: [true, 'User name filed is required']
  },

  fullName: {
    type: String,
    required: [true, 'Full name filed is required']
  },

  email: {
    type: String,
    unique: true,
    required: [true, 'Email filed is required'],
    validate: [validator.isEmail, 'Please enter a valid email address']
  },

  // Google OAuth user ID
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,
    validate: [validator.isMobilePhone, 'Please enter a valid phone number']
  },

  // Password is optional for Google OAuth users
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },

  avatar: {
    type: String
  },

  gender: {
    type: String,
    enum: ['male', 'female']
  },

  // DOB is optional for Google OAuth users
  dob: {
    type: Date,
    validate: {
      validator: (value) => !value || validator.isDate(value),
      message: 'Please enter a valid date of birth'
    }
  },

  // Address is optional for Google OAuth users
  address: {
    type: String
  },

  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },

  verified: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ['register', 'login', 'logout', 'blocked'],
    default: 'register'
  },

  tokenVersion: {
    type: Number,
    default: 0
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Replace spaces with dashes in userName before saving
usersSchema.pre('save', function (next) {
  if (this.userName) {
    this.userName = this.userName.replace(/\s/g, '-');
  }

  next();
});

// Hash password only when a password exists and is modified
usersSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 8);
  return next();
});

// JWT Access Token
usersSchema.methods.getJWTToken = function () {
  return jwt.sign(
    {
      id: this._id,
      tokenVersion: this.tokenVersion
    },
    process.env.JWT_SECRET_KEY,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES
    }
  );
};

// JWT Refresh Token
usersSchema.methods.getJWTRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      tokenVersion: this.tokenVersion
    },
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
    }
  );
};

// Compare password
usersSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generating password reset token
usersSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

// Generating email verification token
usersSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpire = Date.now() + 15 * 60 * 1000;

  return verificationToken;
};

module.exports = mongoose.model('Users', usersSchema);
