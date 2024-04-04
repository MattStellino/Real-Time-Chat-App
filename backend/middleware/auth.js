const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('express-async-handler');

// Middleware to check for authentication
const authenticateUser = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extract the token from the Authorization header
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // If no token is provided, return an unauthorized response
        res.status(401).json({ message: 'Unauthorized - No token provided' });
        return;
    }
     console.log('JWT Token:', token);
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Assuming the token payload contains the user's ID as 'id'
        req.user = await User.findById(decoded._id);

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized - User not found' });
            return;
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error(error);
        // If the token is invalid or expired, return an unauthorized response
        res.status(401).json({ message: 'Unauthorized - Token verification failed' });
    }
    console.log('JWT Token:', token);
});

module.exports = authenticateUser;
