'use strict'

const config = require('../config')
const mongoose = require('mongoose')
const User = require('../models/user.model')
mongoose.Promise = require('bluebird')


mongoose.connection.on('connected', async () => {
  console.log('MongoDB is connected')
  
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    console.log('Existing Admin Details:', existingAdmin ? JSON.stringify(existingAdmin, null, 2) : 'No existing admin');
    
    if (!existingAdmin) {
      // Create admin user
      const adminUser = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'Passw0rd!', // Note: In production, use a more secure method
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
      
      // Optional: Update existing admin if needed
      if (existingAdmin.role !== 'admin' || existingAdmin.status !== 'active') {
        existingAdmin.role = 'admin';
        existingAdmin.status = 'active';
        await existingAdmin.save();
        console.log('Updated existing admin user details');
      }
    }
  } catch (error) {
    console.error('Error in admin user creation process:', error);
    
    // If it's a duplicate key error, log detailed information
    if (error.code === 11000) {
      console.log('Duplicate key error details:', error.message);
      console.log('Duplicate key:', error.keyValue);
    }
  }
})

mongoose.connection.on('error', (err) => {
  console.log(`Could not connect to MongoDB because of ${err}`)
  process.exit(1)
})

if (config.env === 'dev') {
  mongoose.set('debug', true)
}

exports.connect = () => {
  var mongoURI = (config.env === 'prod' || 'dev' ? config.mongo.uri : config.mongo.testURI)

  mongoose.connect(mongoURI, {
    keepAlive: 1,
    useNewUrlParser: true
  })

  mongoose.set('useCreateIndex', true)

  return mongoose.connection
}
