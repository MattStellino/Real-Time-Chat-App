const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const authenticateUser = require('../middleware/auth'); 

// User registration route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).send('User already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).send('Error in creating user');
    }
});

// User login route
router.post('/login', async (req, res) => {
    console.log('Login route reached');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('Authentication failed - user not found');
            return res.status(401).json({ message: 'Authentication failed - user not found' });
        }

        const isPasswordMatch = await user.matchPassword(password);

        if (isPasswordMatch) {
            console.log('Authenticated user:', user);
            // Passwords match, authentication successful
            // Send back a user object with only the necessary information
            const userInfo = {
                _id: user._id, // assuming _id is used in your user model
                username: user.username, // assuming you have a name field
                email: user.email,
                token: generateToken(user._id), // email is already known
                // Add any other relevant user information here, but exclude sensitive data
            };
            return res.status(200).json({
                message: 'Authentication successful',
                user: userInfo // include the user info in the response
            });
        } else {
            console.log('Authentication failed - incorrect password');
            return res.status(401).json({ message: 'Authentication failed - incorrect password' });
        }
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ message: 'Server error during authentication' });
    }
});

router.get(
    '/search',
    authenticateUser,
    asyncHandler(async (req, res) => {
        const { query } = req.query;
        console.log(query)

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


module.exports = router;
