'use strict';

const Page = require('../models/pages.model');
const httpStatus = require('http-status');
const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const User = require('../models/user.model'); // Assuming User model is defined in this file
const mongoose = require('mongoose'); // Add this line to import mongoose
/**
 * Create a new page
 */

// Configure AWS S3
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');


exports.createPage = async (req, res, next) => {
    try {
        const { title, blocks } = req.body;
        console.log("req.body", req.body, req.user);
        
        // Check page limit
        const MAX_FREE_PAGES = 10;
        const pageCount = await Page.countDocuments({ 
            userId: req.user._id, 
            isDeleted: false 
        });

        // Enforce page limit for non-paid users
        if (!req.user.isPaid && pageCount >= MAX_FREE_PAGES) {
            return res.status(httpStatus.FORBIDDEN).json({ 
                message: 'Page creation limit reached. Upgrade to create more pages.' 
            });
        }

        // Only authenticated user can create pages
        const page = new Page({ title, userId: req.user.id, blocks });
        const savedPage = await page.save();

        res.status(httpStatus.CREATED).json(savedPage);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all pages for a user
 */
exports.getPages = async (req, res, next) => {
    try {
        console.log("pages", req.query.userId);
        const pages = await Page.find({ userId: req.query.userId, isDeleted: false }).sort({ createdAt: -1 });
        res.status(httpStatus.OK).json(pages);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single page by ID
 */
exports.getPageById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const page = await Page.findOne({ _id: id, userId: req.user._id, isDeleted: false });

        if (!page) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Page not found' });
        }

        res.status(httpStatus.OK).json(page);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a page by ID
 */
exports.updatePage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, blocks,userId } = req.body;
console.log('req.body',req.body);

        const updatedPage = await Page.findOneAndUpdate(
            { _id: id, userId: userId, isDeleted: false },
            { title, blocks },
            { new: true }
        );

        if (!updatedPage) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Page not found' });
        }

        res.status(httpStatus.OK).json(updatedPage);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a page by ID ( delete)
 */
exports.deletePage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedPage = await Page.findOneAndDelete({
            _id: id
        });

        if (!deletedPage) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Page not found' });
        }

        res.status(httpStatus.OK).json({ message: 'Page deleted successfully' });
    } catch (error) {
        next(error);
    }
};



// Upload image to S3
exports.uploadImage = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: 'Error uploading file.' });
        }

        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file provided.' });
        }

        // Set S3 upload parameters
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${uuidv4()}${path.extname(file.originalname)}`, // Unique file name
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // Upload to S3
        s3.upload(params, (s3Err, data) => {
            if (s3Err) {
                console.log("s3Err", s3Err);
                return res.status(500).json({ error: 'Error uploading to S3.' });
            }
            console.log("data", data);
            return res.status(200).json({
                message: 'File uploaded successfully.',
                fileUrl: data.Location,
                key: data.key
            });
        });

    });
};


// Upload image to S3
exports.deleteImage = async (req, res) => {
    const { key } = req.body; // Image key (path in S3 bucket)

    if (!key) {
        return res.status(400).json({ error: 'Image key is required' });
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME, // Bucket name from environment variables
        Key: key, // Image key in the S3 bucket
    };

    try {
        await s3.deleteObject(params).promise();
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};

/**
 * Check page creation limit based on user's subscription
 */
exports.checkPageLimit = async (req, res) => {
    try {
        // Get userId from query params
        const { userId } = req.query;

        // Validate userId is provided
        if (!userId) {
            return res.status(400).json({ 
                message: 'User ID is required in query parameters' 
            });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                message: 'Invalid user ID provided' 
            });
        }

        // Explicitly convert to ObjectId to prevent any casting issues
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Check total number of non-deleted pages for the user
        const pageCount = await Page.countDocuments({ 
            userId: userObjectId, 
            isDeleted: false 
        });

        // Default limit is 10 for non-paid users
        const MAX_FREE_PAGES = 10;
        
        // Fetch user to check paid status
        const user = await User.findById(userObjectId);
        
        // If user not found, return an error
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Determine if user can create more pages
        const canCreate = user.subscriptionStatus === 'paid' || pageCount < MAX_FREE_PAGES;

        // Prepare and send response
        res.status(200).json({
            pageCount,
            maxPages: MAX_FREE_PAGES,
            canCreate,
            remainingPages: canCreate ? (MAX_FREE_PAGES - pageCount) : 0,
            userPaidStatus: user.subscriptionStatus === 'paid',
            subscriptionExpiry: user.subscriptionExpiry
        });
    } catch (error) {
        // Send a generic error response
        res.status(500).json({ error: 'Failed to count page limit' });
    }
};