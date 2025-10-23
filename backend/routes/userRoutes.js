// User authentication and management routes
// Handles registration, login, and user search functionality
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const authenticateUser = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { 
  registrationLimiter, 
  enhancedLoginLimiter, 
  recordFailedAttempt, 
  clearFailedAttempts,
  getClientId 
} = require('../middleware/rateLimiter'); 

/** POST /register
 * Creates new user account. Body: { username, email, password }
 * Returns: { success: true, message: string } on success, 400 if validation fails
 */
router.post('/register', registrationLimiter, validateRegistration, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists by email
        const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingUserByEmail) {
            return res.status(409).json({
                success: false,
                error: 'An account with this email already exists',
                field: 'email'
            });
        }

        // Check if username is already taken
        const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUserByUsername) {
            return res.status(409).json({
                success: false,
                error: 'This username is already taken',
                field: 'username'
            });
        }

        // Hash password with higher salt rounds for better security
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        await user.save();
        
        // Don't return token on registration - user should login
        res.status(201).json({
            success: true,
            message: 'Account created successfully. Please login to continue.',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                error: `This ${field} is already in use`,
                field: field
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
});

/** POST /login
 * Authenticates user credentials. Body: { email, password }
 * Returns: { success: true, user: { _id, username, email, token } } on success, 401 on failure
 */
router.post('/login', enhancedLoginLimiter, validateLogin, async (req, res) => {
    const { email, password } = req.body;
    const clientId = getClientId(req);

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Record failed attempt even for non-existent users to prevent enumeration
            recordFailedAttempt(email.toLowerCase(), clientId);
            return res.status(401).json({ 
                success: false,
                error: 'Invalid email or password'
            });
        }

        const isPasswordMatch = await user.matchPassword(password);

        if (isPasswordMatch) {
            // Clear any failed attempts on successful login
            clearFailedAttempts(email.toLowerCase());
            
            const userInfo = {
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            };
            
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: userInfo
            });
        } else {
            // Record failed attempt
            const attempts = recordFailedAttempt(email.toLowerCase(), clientId);
            
            return res.status(401).json({ 
                success: false,
                error: 'Invalid email or password',
                attemptsRemaining: Math.max(0, 5 - attempts)
            });
        }
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
});

/** GET /search?query=<string>
 * Requires auth. Searches users by username/email (case-insensitive)
 * Returns: Array of user objects, excludes current user
 */
router.get(
    '/search',
    authenticateUser,
    asyncHandler(async (req, res) => {
        const { query } = req.query;

        // Use a regex query to find users with matching usernames or other relevant fields
        const users = await User.find({
            $and: [ // Use $and to combine the exclusion with the search conditions
                {
                    $or: [
                        { username: { $regex: new RegExp(query, 'i') } },
                        { email: { $regex: new RegExp(query, 'i') } }
                    ]
                },
                { _id: { $ne: req.user._id } } 
            ]
        });
        res.status(200).json(users);
    })
);

/** GET /api/user/me
 * Returns the authenticated user (without password)
 */
router.get('/me', authenticateUser, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
}));

/** GET /api/user/:id
 * Returns another user's public profile (without password)
 */
router.get('/:id', authenticateUser, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Don't allow users to get their own profile through this endpoint
    if (id === req.user._id.toString()) {
        return res.status(400).json({ error: 'Use /me endpoint for your own profile' });
    }
    
    const user = await User.findById(id).select('-password -email -preferences');
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
}));

/** PUT /api/user
 * Update profile fields: username, bio, avatarUrl
 */
router.put('/', authenticateUser, asyncHandler(async (req, res) => {
    const { username, bio, avatarUrl } = req.body;
    
    // Check if username is being changed and if it's unique
    if (username && username !== req.user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already taken' });
        }
    }
    
    const updateData = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
}));

/** PUT /api/user/preferences
 * Update user preferences (partial updates allowed)
 */
router.put('/preferences', authenticateUser, asyncHandler(async (req, res) => {
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ error: 'Invalid preferences object' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { preferences } },
        { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
}));

/** PUT /api/user/password
 * Change user password
 */
router.put('/password', authenticateUser, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    
    res.json({ message: 'Password updated successfully' });
}));

module.exports = router;
