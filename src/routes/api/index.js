'use strict'
const express = require('express')
const router = express.Router()
const authRouter = require('./auth.route')
const pagesRouter = require('./pages.route')
const userRouter = require('./user.route')

// Global route logging middleware
router.get('/status', (req, res) => { res.send({ status: 'OK' }) }) // api status

router.use('/auth', authRouter) // mount auth paths

router.use('/users', userRouter)

// Log pages router registration
console.log('GLOBAL ROUTE DEBUG: Registering pages router');
router.use('/pages', pagesRouter)

module.exports = router
