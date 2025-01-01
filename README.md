# Page Craft Pro - Backend

## Overview
Page Craft Pro is a powerful web application that allows users to create and manage digital pages with ease. Built with Node.js, Express, and MongoDB, it offers a flexible and scalable solution for content creation.

## Features
- User Authentication & Authorization
- Page Creation with Flexible Blocks
- Subscription-based Page Limits
- Admin Management
- Secure API Endpoints
- **AWS S3 Image Storage**

## Subscription Plans
### Free Plan
- Maximum 10 pages
- Basic page creation features

### Page Craft Pro (Paid Plan)
- Unlimited page creation
- Advanced features
- Priority support

## Image Storage
Page Craft Pro utilizes Amazon S3 for robust and scalable image storage:
- Secure cloud-based image hosting
- High availability and durability
- Efficient image upload and retrieval

### AWS S3 Configuration
To configure S3 image storage, set the following environment variables:
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
```

## Prerequisites
- Node.js (v14+ recommended)
- MongoDB (v4+ recommended)
- AWS S3 Account
- npm

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/page-craft-pro-backend.git
cd page-craft-pro-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file with the following variables:
```
PORT=3000
MONGOURI=mongodb://localhost:27017/pagecraftpro
JWT_SECRET=your_jwt_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
```

### 4. Run the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: User login
- `PUT /api/users/status/:userId`: Update user status (Admin only)

### Pages
- `POST /api/pages`: Create a new page with image upload
- `GET /api/pages`: Retrieve user's pages
- `PUT /api/pages/:pageId`: Update a page
- `DELETE /api/pages/:pageId`: Delete a page

## User Roles
- `user`: Standard user with page creation limits
- `admin`: Full system access, unlimited page creation

## Page Creation Limits
- Free Plan: 10 pages
- Page Craft Pro: Unlimited pages

## Security
- JWT-based authentication
- Role-based access control
- Password hashing
- Secure S3 image storage
- Input validation

## Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Detailed logging

## License
This project is licensed under the MIT License.
