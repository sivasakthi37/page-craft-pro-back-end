const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/pages.controller');
const auth = require('../../middlewares/authorization');
const authorize = require('../../middlewares/authorize');

// Middleware to enforce authentication

// Create a new page
router.post('/', auth, authorize(['user', 'admin']), pageController.createPage);

// Get all pages for the authenticated user
router.get('/', auth, authorize(['user', 'admin']), pageController.getPages);

// Get a single page by ID
router.get('/:id', auth, authorize(['user', 'admin']), pageController.getPageById);

// Update a page by ID
router.put('/:id', auth, authorize(['user', 'admin']), pageController.updatePage);

// Delete a page by ID (soft delete)
router.delete('/:id', auth, authorize(['user', 'admin']), pageController.deletePage);

router.post('/upload', auth, authorize(['user', 'admin']), pageController.uploadImage);

router.delete('/delete/image', auth, authorize(['user', 'admin']), pageController.deleteImage);

router.get('/page/limit', auth, authorize(['user', 'admin']), pageController.checkPageLimit);

module.exports = router;
